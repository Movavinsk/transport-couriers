<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Sdcn\Models\Bid;
use Sdcn\Models\Job;
use Sdcn\Models\Location;
use Sdcn\Models\Team;
use Sdcn\Models\User;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Models\Values\EarthRange;
use Sdcn\Repositories\Contracts\JobRepositoryInterface;

/**
 * Class JobRepository
 * @package Sdcn\Repositories
 */
class JobRepository extends AbstractRepository implements JobRepositoryInterface
{
    protected $sorters = [
        'id' => [],
        'priority' => [],
        'pickup_date' => [],
        'destination_date' => [],
        'expiry_time' => [],
        'amount' => [],
        'created_at' => [],
        'status' => [],
        'status_date' => [],
    ];

    protected $filters = [
        'id' => ['id = ?', ':value'],
        'priority' => ['priority = ?', ':value'],
        'pickup_address' => ['pickup_point LIKE ?', '%:value%'],
        'pickup_date' => ['DATE(pickup_date) = ?', ':value'],
        'destination_address' => ['destination_point LIKE ?', '%:value%'],
        'destination_date' => ['DATE(destination_date) = ?', ':value'],
        'vehicle_id' => ['vehicle_id = ?', ":value"],
        'user_id' => ['user_id = ?', ":value"],
        'browse_user_id' => ['user_id <> ?', ":value"],
        'bid_id' => ['bid_id = ?', ":value"],
        'bid_user_id' => ['bid_user_id = ?', ":value"],
        'details' => ['details LIKE ?', '%:value%'],
        'expiry_time' => ['DATE(expiry_time) = ?', ':value'],
        'accept_phone' => ['accept_phone = ?', ':value'],
        'accept_email' => ['accept_email = ?', ':value'],
        'phone' => ['phone LIKE ?', '%:value%'],
        'email' => ['email LIKE ?', '%:value%'],
        'created_at_date_begin' => ['DATE(created_at) >= ?', ':value'],
        'created_at_date_end' => ['DATE(created_at) <= ?', ':value'],
        'status' => ['status LIKE ?', ':value'],
        'status_date_begin' => ['DATE(status_date) >= ?', ':value'],
        'status_date_end' => ['DATE(status_date) <= ?', ':value'],
        'search' => ['pickup_point LIKE ? OR destination_point LIKE ? OR email LIKE ? OR phone LIKE ? OR details LIKE ? OR status LIKE ?', '%:value%', '%:value%', '%:value%', '%:value%', '%:value%', '%:value%'],
    ];

    public $team_work_source = 'team-work';

    /**
     * @param Job $model
     */
    public function __construct(Job $model)
    {
        $this->model = $model;
    }

    public function filterByTeamId($teamId)
    {
        return $this->query->whereHas('bid.user', function($subquery) use($teamId) {
            return $subquery->whereTeamId($teamId);
        });
    }

    /**
     * filter out all the bids you're not entitled to see
     */
    public function whereBidNotAccepted(User $user)
    {
        return $this->query->where('bid_user_id', $user->id)
            ->orWhereNull('bid_id');
    }

    public function getStatistics()
    {
        $this->make();
        $this->query->groupBy('status')->select(\DB::raw('status AS name, COUNT(*) AS count'));
        unset($this->filterBy['status']);
        $this->applyFilters();
        $this->applyCallableFilters();

        // We're going to use ->getQuery to retrieve raw results from the database.
        // the directly usage of ->get would cause auto hydration with eloquent objects.
        return collect($this->query->getQuery()->get())->keyBy('name');
    }

    /**
     * Get the team participants in the filtering. This function is aware of the work_source filter and
     * would take the necessary action to limit the results based on it.
     */
    public function getTeamParticipants(Team $team)
    {
        switch($this->team_work_source) {
            case 'my-work':
                return [Auth::user()->id];

            case 'team-work':
                return $team->getMembersIds();
        }

        throw new \Exception("Invalid team_work_source");
    }

    public function filterWhereUserBidded(User $user)
    {
        return $this->query->whereHas('bids', function($subquery) use($user) {
            return $subquery->where("user_id", $user->id);
        });
    }

    /**
     * Aware of work_source.
     */
    public function filterWhereTeamBidded(Team $team)
    {
        return $this->query->whereHas('bids', function($subquery) use($team) {
            return $subquery->whereIn("user_id", $this->getTeamParticipants($team));
        // });
        })->whereIn('bid_user_id', $team->members->pluck('id'));
    }

    /**
     * Aware of work_source.
     */
    public function eagerLoadUserBid(User $user)
    {
        return $this->query->with([
            'userBid' => function($subquery) use($user) {
                // We're using user_id as a small hack for optimization purposes
                // so we'll not need to jump in three different tables for a basic query.

                return $subquery->where('user_id', $user->id);
            },
            'userBid.user' => function($subquery) {}
        ]);
    }

    public function postedByTeamMembers($team_id)
    {
        if( is_null($this->query) ) $this->make();

        return $this->query->whereIn('user_id', Team::find($team_id)->getMembersIds());
    }

    /**
     * Aware of work_source.
     */
    public function eagerLoadTeamBid(Team $team)
    {
        return $this->query->with([
            'teamBid' => function($subquery) use($team) {
                // We're using user_id as a small hack for optimization purposes
                // so we'll not need to jump in three different tables for a basic query.

                return $subquery->whereIn('user_id', $this->getTeamParticipants($team));
            },
            'teamBid.user' => function($subquery) {}
        ]);
    }

    public function create($attributes)
    {
        \DB::beginTransaction();

        try
        {
            $item = $this->model->create($attributes);

            if( array_key_exists('bid_manual', $attributes) && $attributes['bid_manual'] == 1 )
            {
                $bid = Bid::forceCreate(
                    array(
                        'job_id' => $item['id'],
                        'user_id' => $attributes['bid_user_id'],
                        'bid_date' => $attributes['status_date'],
                        'amount' => $attributes['bid_amount'],
                        'details' => 'Auto-generated bid for manually allocated job!',
                        'add_vat' =>$attributes['bid_add_vat'],
                        'manual' => true
                    )
                );

                Event::fire('job.allocated.manually', $bid);

                $attributes['bid_id'] = $bid->id;

                $item->update($attributes);
            }

            if( array_key_exists('way_points', $attributes) )
            {
                $item->way_points = $attributes['way_points'];

                $item->save();
            }
        }
        catch(\Exception $e)
        {
            \DB::rollback();

            throw $e;
        }
        \DB::commit();

        return $item;
    }

    public function update($id, $attributes)
    {
        $item = $this->model->findOrFail($id);

        \DB::beginTransaction();

        try
        {
            if( array_key_exists('bid_manual', $attributes) && $attributes['bid_manual'] == 1 && $item['status'] == 'active' )
            {
                $bid = Bid::forceCreate(
                    array(
                        'job_id' => $item['id'],
                        'user_id' => $attributes['bid_user_id'],
                        'bid_date' => $attributes['status_date'],
                        'amount' => $attributes['bid_amount'],
                        'details' => 'Auto-generated bid for manually allocated job!',
                        'add_vat' =>$attributes['bid_add_vat'],
                        'manual' => true
                    )
                );

                Event::fire('job.allocated.manually', $bid);

                $attributes['bid_id'] = $bid->id;
            }

            if ($item->status === 'expire' && isset($attributes['expiry_time']))
            {

                if (\Carbon\Carbon::parse($attributes['expiry_time'])->isFuture())
                {

                    $attributes['status'] = 'active';

                    Event::fire('job.reinstated', $item);

                }

            }

            $item->update($attributes);

            if( array_key_exists('way_points', $attributes) )
            {
                $item->way_points = $attributes['way_points'];

                $item->save();
            }
        }
        catch(\Exception $e)
        {
            \DB::rollback();

            throw $e;
        }
        \DB::commit();

        return $item;
    }

    /**
     * @param string $team_work_source
     */
    public function setTeamWorkSource($team_work_source)
    {
        $this->team_work_source = $team_work_source;
    }

    protected function applyFilters()
    {
        if(array_key_exists('pickup_latitude', $this->filterBy) && array_key_exists('pickup_longitude', $this->filterBy) && array_key_exists('pickup_address', $this->filterBy)) {
            unset($this->filterBy['pickup_address']);
        }

        if(array_key_exists('destination_latitude', $this->filterBy) && array_key_exists('destination_longitude', $this->filterBy) && array_key_exists('destination_address', $this->filterBy)) {
            unset($this->filterBy['destination_address']);
        }

        parent::applyFilters();

       if(array_key_exists('browse_team_id', $this->filterBy)) {
           $this->query->whereNotIn('user_id', Auth::user()->team->getMembersIds());
       }

       if(array_key_exists('status', $this->filterBy) && $this->filterBy['status'] == 'active') {
           $this->query->whereRaw('`status` = "active" AND `expiry_time` > now()');
       }


        // Filter the results based on the pickup point
        if ( array_key_exists('pickup_latitude', $this->filterBy) &&  array_key_exists('pickup_longitude', $this->filterBy)) {
            $within = new EarthPoint($this->filterBy['pickup_latitude'], $this->filterBy['pickup_longitude']);
            $this->query->pointLocatedWithin('pickup', $within, data_get($this->filterBy, 'pickup_miles', 5));
        }

        // Filter the results based on the destination
        if ( array_key_exists('destination_latitude', $this->filterBy) &&  array_key_exists('destination_longitude', $this->filterBy)) {
            $within = new EarthPoint($this->filterBy['destination_latitude'], $this->filterBy['destination_longitude']);
            $this->query->pointLocatedWithin('destination', $within, data_get($this->filterBy, 'destination_miles', 5));
        }

        if (array_key_exists('in_areas', $this->filterBy)) {
            $locations = Location::whereUserId($this->filterBy['in_areas'])->get()->map(function(Location $location) {
                return new EarthRange(new EarthPoint($location->latitude, $location->longitude), $location->miles);
            });

            $this->query->pointLocatedWithinMultiple('pickup', $locations);

            // If the user doesn't have locations then empty the results
            if ($locations->isEmpty()) {
                $this->query->where(\DB::raw(1), 0);
            }
        }
    }

    public function get()
    {
        if (is_null($this->query)) {
            $this->make();
        }

        $this->applyFilters();

        $this->applyCallableFilters();

        $this->applySorters();

        if (is_null($this->perPage)) {
            return $this->query->whereNotBlocked()->get();
        } else {
            $perPage = $this->perPage == -1 ? 99999 : ((int) $this->perPage ?: 10);

            $currentPage = $this->currentPage ?: 1;

            $notBlockedQuery = $this->query->whereNotBlocked();
            $count = $notBlockedQuery->count();

            $items = $notBlockedQuery
                ->skip(($currentPage - 1) * $perPage)
                ->limit($perPage)
                ->get();

            return new LengthAwarePaginator($items, $count, $this->perPage);
        }
    }
}
