<?php namespace Sdcn\Repositories;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Sdcn\Models\Team;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Repositories\Contracts\TeamRepositoryInterface;

/**
 * Class TeamRepository
 * @package Sdcn\Repositories
 */
class TeamRepository extends AbstractRepository implements TeamRepositoryInterface
{

    protected $sorters = [
        'company_name' => [],
        'expire_at' => [],
        'created_at' => [],
        'type' => [],
    ];

    protected $filters = [
        // 'search' => ['(company_name LIKE ? OR vat_number LIKE ? OR company_number LIKE ? OR postal_code LIKE ?)', '%:value%', '%:value%', '%:value%', '%:value%']
        'search' => ['company_name LIKE ?', '%:value%'],
        'members_directory' => ['members_directory = 1'],
        'deactivated_at' => ['is_expired = 0 AND deactivated_at IS NULL']
    ];

    public function __construct(Team $model)
    {
        $this->model = $model;
    }

    public function update($id, $attributes)
    {
        if (!auth()->user()->is_admin) {
            // if user is not an admin, don't allow him to update the following:
            $blockUpdateOf = [
                'company_name',
                'company_number',
                'vat_number',
                'address_line_1',
                'address_line_2',
                'town',
                'county',
                'postal_code',
            ];

            // unset the keys from the attributes
            foreach($blockUpdateOf as $key) {
                if (array_key_exists($key, $attributes)) {
                    unset($attributes[$key]);
                }
            }
        }

        $team = $this->model->findOrFail($id);

        if (array_key_exists('expire_at', $attributes) && !Carbon::parse($attributes['expire_at'])->isPast()) {
            // reset the Membership about to expire Alerts
            $attributes['alerted'] = false;
            // $attributes['is_expired'] = true;
        }

        /**
         * The logic for uploading files doesn't belong to a repository.
         * Acutally, the entire uploading shall be refactored to it's own
         * and only entity. For now, I'm going to just cut-paste it due to bc.
         */
        if (array_key_exists('file', $attributes) && $attributes['file']->isValid()) {
            $file_path = public_path() . $team->invoice_logo;

            if (is_file($file_path)) {
                unlink($file_path);
            }

            $file = $attributes['file'];

            $file_name = $team->id . "." . $file->getClientOriginalExtension();

            $file->move(public_path() . config('info.upload_path.invoice_icon'), $file_name);

            $attributes["invoice_logo"] = config('info.upload_path.invoice_icon') . $file_name;
        }

        return $team->update($attributes);
    }

    /**
     * Extend filters
     */
    public function applyFilters()
    {
        parent::applyFilters();

        if (array_key_exists('expires_in', $this->filterBy)) {

            $this->query = Team::expiringIn($this->filterBy['expires_in'], $this->query);

        }

        if (array_key_exists('vehicle_min', $this->filterBy) && array_key_exists('vehicle_max', $this->filterBy)) {

            $this->query->vehicleSize($this->filterBy['vehicle_min'], $this->filterBy['vehicle_max']);

        }

        if (array_key_exists('member_latitude', $this->filterBy) && array_key_exists('member_longitude',
                $this->filterBy)) {

            $within = new EarthPoint($this->filterBy['member_latitude'], $this->filterBy['member_longitude']);

            $locs = Team::pointLocatedWithin($within, data_get($this->filterBy, 'member_miles', 5));

            $this->query->whereIn('teams.id', $locs->pluck('teams.id'));

        }

    }

    public function showOnlyBlockedTeams()
    {
        $this->model = Auth::user()->team->blockedTeams();
    }

}
