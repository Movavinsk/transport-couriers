<?php namespace Sdcn\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Sdcn\Models\Scopes\Haversine;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Models\Values\EarthRange;
use Sdcn\Models\Values\InvoiceOptions;

/**
 * @property User             user
 * @property InvoiceOptions   $invoice_options
 */
class Job extends AbstractModel
{
	protected $fillable = [
		'priority',
		'distance',
		'duration',
		'pickup_point',
		'pickup_latitude',
		'pickup_longitude',
        'pickup_date',
        'flexible_pickup',
        'pickup_date_end',
        'destination_point',
        'destination_latitude',
        'destination_longitude',
        'destination_date',
        'flexible_destination',
        'destination_date_end',
        'pickup_postcode_prefix',
        'pickup_town',
        'destination_postcode_prefix',
        'destination_town',
		'vehicle_id',
		'details',
		'expiry_time',
		'accept_phone',
        'accept_online',
		'phone',
		'accept_email',
		'email',
		'user_id',
		'amount',
		'status',
		'status_date',
		'bid_id',
		'bid_user_id',
		'bid_amount',
		'bid_manual',
		'bid_details',
		'feedback_rate',
		'feedback_comments',
        'payment_received',
        'additional_options',
        'backload',
        'pickup_asap',
        'destination_asap',
        'customer_job_reference_number',
        'pickup_postcode_prefix',
        'pickup_town',
        'destination_postcode_prefix',
        'destination_town',
        'pickup_formatted_address',
        'destination_formatted_address'
	];


	protected $appends = [
		'team_id',
		'name_full',
		'contact_email',
		'contact_phone',
		'vehicle_icon',
		'way_points',
		'my_bid_id',
		'bid',
		'bids_count',
		'user_info',
		'invoice_options',
		'distance_in_miles',
		'vehicle_icon_png',
		'has_user_bid',
		'vehicle_name',
	];

	protected $dates = [
		'expiry_time',
		'pickup_date',
		'destination_date',
		'pickup_date_end',
		'destination_date_end',
	];

	protected $with = ['feedback', 'vehicle'];

	protected $hidden = ['user'];

	public function __construct(array $attributes = [])
	{
		parent::__construct($attributes);

		$this->toCustomArrayFields['browse'] = array_merge($this->fillable, $this->appends, ['id', 'my_bid_id']);
		$this->toCustomArrayFields['info'] = ['company_name', 'contact_email'];
	}

	/**
	 * @param Builder     $query
	 * @param string      $prefix
	 * @param EarthPoint  $within
	 * @param int         $range
	 */
	public function scopePointLocatedWithin(Builder $query, $prefix, EarthPoint $within, $range, $boolean = 'and')
	{
		$harvesine = new Haversine($prefix.'_latitude', $prefix.'_longitude');
		$harvesine->applyDistanceConstraints($query, $within->latitude, $within->longitude, $range, $boolean);
	}

	public function scopePointLocatedWithinMultiple(Builder $query, $prefix, Collection $ranges)
	{
		$query->where(function(Builder $subquery) use($prefix, $ranges) {
			foreach ($ranges as $range) {
				/** @var EarthRange $range */
				$this->scopePointLocatedWithin($subquery, $prefix, $range->point, $range->distance, 'or');
			}
		});
	}

    public function getInvoiceOptionsAttribute()
    {
        return $this->user->team->invoice_options;
    }

	public function user()
	{
		return $this->belongsTo('Sdcn\Models\User');
	}

	public function team()
	{
        return $this->belongsTo(Team::class);
	}

    public function getTeamIdAttribute() {
		if (!$this->user) {
			return;
		}

        return $this->user()->first()->team_id;
    }

	public function getNameFullAttribute()
	{
		return $this->user->name_first . ' ' . $this->user->name_last;
	}

    public function getCompanyNameAttribute()
    {
        return $this->user->company_name;
    }

	// Only return if accepted by user
	public function getContactEmailAttribute()
	{
		return $this->accept_email ? array_key_exists('email', $this->attributes) ? $this->attributes['email'] : $this->user->email : null;
	}

	// Only return if accepted by user
	public function getContactPhoneAttribute()
	{
		return $this->accept_phone ? array_key_exists('phone', $this->attributes) ? $this->attributes['phone'] : $this->user->phone : null;
	}

    public function getPickupDateAttribute()
    {
        return (new \DateTime($this->attributes["pickup_date"]))->format('Y-m-d H:i:s');
    }

	public function getPickupDateEndAttribute()
	{
		return $this->attributes["pickup_date_end"] ? (new \DateTime($this->attributes["pickup_date_end"]))->format('Y-m-d H:i:s') : null;
	}

    public function getPickupAndTime($usePoint = false)
    {
        if ($usePoint || !$this->pickup_town) {
            $pickupLocation = "{$this->pickup_point}";
        } else {
            $pickupLocation = "{$this->pickup_town}";
        }

        if($this->flexible_pickup){
            return "{$pickupLocation} at "
                . Carbon::parse($this->pickup_date)->format("M j Y, H:i")
                . " - "
                . Carbon::parse($this->pickup_date_end)->format("M j Y, H:i");
        }elseif($this->pickup_asap){
            return "{$pickupLocation} ASAP";
        }else{
            return $this->getFormattedLocation($pickupLocation, $this->pickup_date);
        }
    }

    public function getDestinationDateAttribute()
    {
        return (new \DateTime($this->attributes["destination_date"]))->format('Y-m-d H:i:s');
    }

    public function getDestinationDateEndAttribute()
    {
        return $this->attributes["destination_date_end"] ? (new \DateTime($this->attributes["destination_date_end"]))->format('Y-m-d H:i:s') : null;
	}

    public function getDestinationAndTime($usePoint = false)
    {
        if ($usePoint || !$this->destination_town) {
            $destination = "{$this->destination_point}";
        } else {
            $destination = "{$this->destination_town}";
        }

        if($this->flexible_destination){
            return "{$destination} at "
                . Carbon::parse($this->destination_date)->format("M j Y, H:i")
                . " - "
                . Carbon::parse($this->destination_date_end)->format("M j Y, H:i");
        }elseif($this->destination_asap){
            return "{$destination} ASAP";
        }else{
            return $this->getFormattedLocation($destination, $this->destination_date);
        }
    }

    private function getFormattedLocation($location, $asap)
    {
        if ($asap) {
            return "{$location} at " . Carbon::parse($asap)->format("M j Y, H:i");
        }

        return "{$location} ASAP";
    }

	public function sentNotifications()
	{
		return $this->hasMany(SentJobNotification::class);
	}

	public function vehicle()
	{
		return $this->belongsTo('Sdcn\Models\Vehicle');
	}

	public function getVehicleIconAttribute()
	{
		return $this->vehicle->icon;
	}

	public function getVehicleNameAttribute()
	{
		return $this->vehicle->name;
	}

	public function getVehicleIconPngAttribute()
	{
		return $this->vehicle->icon_png;
	}

	public function wayPoints()
	{
		return $this->hasMany('Sdcn\Models\WayPoint');
	}

	public function getWayPointsAttribute()
	{
		return $this->wayPoints()->get()->toArray();
	}

	public function setWayPointsAttribute($way_points)
	{
		$total = count($way_points);

		$cnt = 0;

		foreach($this->wayPoints()->get() as $wp)
		{
			if( $total && $cnt < $total )
			{
				$wp->way_point = $way_points[$cnt]['way_point'];

				$wp->stopoff_date = $way_points[$cnt]['stopoff_date'];

				$wp->save();
			}
			else
			{
				$wp->delete();
			}
			$cnt ++;
		}
		for($i = $cnt; $i < $total ; $i++)
		{
			$this->wayPoints()->save(new WayPoint($way_points[$i]));
		}
	}

    public function acceptBid(Bid $bid)
    {
        $this->update(['bid_id' => $bid->id, 'bid_user_id' => $bid->user_id, 'bid_amount' => $bid->amount]);
    }

	public function bid()
	{
		return $this->belongsTo('Sdcn\Models\Bid');
	}

	public function getBidAttribute()
	{
		if( $this->bid_id )
		{
			return $this->bid()->first()->toArray();
		}
		else
		{
			return null;
		}
	}

	public function bids()
	{
		return $this->hasMany('Sdcn\Models\Bid');
	}

    /**
     * Helper for angular to display the relevant person of the team who bidded on this job.
     * It should be used with a eager load constraint with(['posts' => function($subquery)]
     */
    public function userBid()
    {
        return $this->hasOne('Sdcn\Models\Bid');
    }

    /**
     * Helper for angular to display the relevant person of the team who bidded on this job.
     * It should be used with a eager load constraint with(['posts' => function($subquery)]
     */
    public function teamBid()
    {
		return $this->hasOne('Sdcn\Models\Bid');
    }

	public function getBidsCountAttribute() {
		return $this->bids()->count();
	}

	public function getMyBidIdAttribute() {
        if (!\Auth::check()) { return; }
        return (bool) $this->bids->where('user_id', \Auth::user()->id)->count();
	}

	public function getUserInfoAttribute()
	{
		return $this->user->toInfo();
	}

	public function getParticipants()
	{
		$participants = [$this->user_id];
		if($this->bid) {
			$participants[] = $this->bid['user_id'];
		}

		return $participants;
	}

    public function getExtendedParticipants()
    {
        $participants = $result = $this->getParticipants();
        foreach($participants as $user_id) {
            $user = User::find($user_id);
            $result = array_merge($result, $user->getColleaguesIds());
        }

        return $result;
    }

	public function getOtherParticipant($actual_participant)
	{
		$difference = array_diff($this->getParticipants(), [$actual_participant]);

		// In case that the difference is empty it means that the bidder and the job owner are the same person.
		// So lets just return the job owner in order to prevent an error due to the emptiness of the $difference array.
		if ( ! $difference) {
			return $this->user_id;
		}

		foreach ($difference as $first) {
			return $first;
		}
	}

	public function feedback()
	{
		return $this->hasOne('Sdcn\Models\Feedback')->whereNull('bid_id');
	}

    public function setExpiryTimeAttribute($value)
    {
        $this->attributes['expiry_time'] = Carbon::parse($value);
    }

    public function getDistanceInMilesAttribute()
    {
        return round((int) $this->distance * 0.0006213, 2);
    }

    public function setAdditionalOptionsAttribute($value)
    {

	    $this->attributes['additional_options'] = array_reduce($value, function($carry, $option) {

            if (!isset($option['label'])) {

                $carry = $option . ':' . $carry;

            } else {

    	        $carry = $option['label'].':'.$carry;

            }

	        return rtrim($carry, ' :');

	    });

    }

    public function getAdditionalOptionsAttribute()
    {
        return explode(':', $this->attributes['additional_options']);
    }

    public function usersWithinSetDistance($distanceInMiles = 49)
    {
        $userQuery = User::query();

        $havesine = new Haversine('last_latitude', 'last_longitude');
        $havesine->applyDistanceConstraints($userQuery, $this->pickup_latitude, $this->pickup_longitude, $distanceInMiles);
        return $userQuery->get();
    }

    public function scopeNearbyJobs($query, $point)
    {
        return $query->pointLocatedWithin('pickup', $point, config('app.notification_distance'))
            ->where('expiry_time', '>', Carbon::now())->where('status', 'active');
    }

    public function scopeWhereNotBlocked($query)
    {
        $blockedBy = Auth::user()->team->teamsBlockedBy()->pluck('teams.id');

        return $query->whereHas('user.team', function ($query) use ($blockedBy) {
            $query->whereNotIn('id', $blockedBy);
        });
    }

    public function getHasUserBidAttribute()
    {
        $user = Auth::user() ?? User::getAuthenticatedApiUser();

        return $this->bids()->where('user_id', $user->id)->count() ? true : false;
    }
}
