<?php namespace Sdcn\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use PhpParser\Comment\Doc;
use Sdcn\Models\Document;
use Sdcn\Models\Vehicle;
use Sdcn\Models\Feedback;
use Sdcn\Models\Scopes\Haversine;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Models\Values\EarthRange;
use Sdcn\Models\Values\InvoiceOptions;
use Sdcn\Models\Values\InvoiceRecipient;

/**
 * @property InvoiceRecipient $invoice_recipient
 * @property InvoiceOptions   $invoice_options
 * @property User             $invoiceUserRecipient
 * @property User             $primaryMember
 * @property Carbon           $expire_at
 */
class Team extends AbstractModel {

    protected $fillable = [
        'id',
        'company_name',
        'company_number',
        'vat_number',
        'address_line_1',
        'address_line_2',
        'town',
        'county',
        'postal_code',
        'subscription_amount',
        'payment_method',
        'billing_frequency',
        'expire_at',
        'invoice_recipient_id',
        'invoice_recipient_name',
        'invoice_recipient_email',
        'invoice_recipient_phone',
        'invoice_footer_text',
        'invoice_including_vat',
        'invoice_logo',
        'invoice_address_line_1',
        'invoice_address_line_2',
        'invoice_town',
        'invoice_county',
        'invoice_postal_code',
        'use_company_address',
        'external_invoice_recipient',
        'deactivated_at',
        'is_expired',
        // 'updated_at',
        'created_at',
        'alerted',
        'can_bid',
        'lat',
        'lng',
        'members_directory',
        'type',
    ];

    protected $appends = ['invoice_details', 'is_expired', 'score', 'ratings_count', 'invoice_recipient', 'score', 'ratings_count', 'expire_in_days', 'is_blocked'];

    protected $toCustomArrayFields = [
        'info' => ['id', 'company_name', 'company_number', 'vat_number', 'address_line_1', 'address_line_2', 'town', 'county', 'postal_code', 'invoice_details', 'deactivated_at', 'score', 'ratings_count',],
        'invoicedetails' => ['invoice_recipient_id', 'invoice_recipient_name', 'invoice_recipient_email', 'invoice_recipient_phone', 'invoice_footer_text', 'invoice_including_vat', 'invoice_logo', 'invoice_address_line_1', 'invoice_address_line_2', 'invoice_town', 'invoice_county', 'invoice_postal_code',]
    ];

    protected $with = ['primaryMember'];

    protected $casts = [
        'can_bid' => 'boolean',
        'is_expired' => 'boolean'
    ];

    protected $dates = ['expire_at'];

    public function hasMember($id)
    {
        return in_array($id, $this->members()->pluck('id')->toArray());
    }

    /**
     * Get human friendly expire_at format
     */
    public function getExpireInDaysAttribute()
    {
        return \Carbon\Carbon::now()->diffInDays($this->expire_at);
    }

    /**
     * Since the laravel usage of carbon doesn't recongize the javascript format
     * of the date then we're going to use our own setter for that.
     */
    public function setExpireAtAttribute($value)
    {
        $this->attributes['expire_at'] = Carbon::parse($value);
    }

    public function primaryMember()
    {
        return $this->hasOne('Sdcn\Models\User')->whereHas('roles', function($query) {
            return $query->whereName('team.member.primary');
        });
    }

	public function members()
	{
		return $this->hasMany('Sdcn\Models\User');
	}

    public function documents()
    {
        return $this->hasManyThrough(Document::class, User::class);
    }

    public function feedback()
    {
        return $this->hasManyThrough(Feedback::class, User::class, 'team_id', 'owner_id');
    }

    public function locations()
    {
        return $this->hasManyThrough(Location::class, User::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function blockedTeams()
    {
        return $this->belongsToMany(Team::class, 'blocked_teams', 'team_id', 'blocked_team_id')
            ->withTimestamps();
    }

    public function teamsBlockedBy()
    {
        return $this->belongsToMany(Team::class, 'blocked_teams', 'blocked_team_id', 'team_id')
            ->withTimestamps();
    }

    public function scopePointLocatedWithin(Builder $query, EarthPoint $within, $range, $boolean = 'and')
    {
        $harvesine = new Haversine('lat', 'lng');
        $harvesine->applyDistanceConstraints($query, $within->latitude, $within->longitude, $range, $boolean);
    }

    public function vehicles()
    {
        return $this->members()->with('vehicles')
            ->get()->map(function($member){
                return $member->vehicles;
            })->flatten();
    }

    public function scopeVehicleSize(Builder $query, $vehicle_min, $vehicle_max) {
        return $query->with('primaryMember')
            ->join('users as u', 'u.team_id', '=', 'teams.id')
            ->join('user_vehicle as uv', 'u.id', '=', 'uv.user_id')
            ->join('vehicles as v', 'uv.vehicle_id', '=', 'v.id')
            ->where('v.size', '>=', $vehicle_min)
            ->where('v.size', '<=', $vehicle_max)
            ->distinct()
            ->select('teams.*');
    }

    public function invoiceUserRecipient()
    {
        return $this->belongsTo('Sdcn\Models\User', 'invoice_recipient_id');
    }

    public function getInvoiceRecipientAttribute()
    {
        if((bool) $this->external_invoice_recipient) {
            return new InvoiceRecipient($this->attributes["invoice_recipient_name"], $this->attributes["invoice_recipient_email"], $this->attributes["invoice_recipient_phone"]);
        }

        if($this->invoice_recipient_id) {
            return $this->invoiceUserRecipient->instantiateInvoiceRecipient();
        }

        if($this->primaryMember)
        {
            return $this->primaryMember->instantiateInvoiceRecipient();
        }

        return false;
    }

    public function getInvoiceRecipientNameAttribute()
    {
        return $this->getInvoiceRecipientAttribute() ? $this->getInvoiceRecipientAttribute()->getName() : null;
    }

    public function getInvoiceRecipientEmailAttribute()
    {
        return $this->getInvoiceRecipientAttribute() ? $this->getInvoiceRecipientAttribute()->getEmail() : null;
    }

    public function getInvoiceRecipientPhoneAttribute()
    {
        return $this->getInvoiceRecipientAttribute() ? $this->getInvoiceRecipientAttribute()->getPhone(): null;
    }

    public function getInvoiceOptionsAttribute()
    {
        // This only affects users who do not setup their invoice details.
        if ($this->invoice_recipient) {
            return new InvoiceOptions($this->invoice_recipient, $this->invoice_footer_text, $this->invoice_including_vat, $this->invoice_logo);
        }
    }

    public function getMembersIds()
    {
        return $this->members()->pluck('id');
    }

    /**
     *  Get Teams expiring in $window
     *  @param string $window ['day', week', month', 'quarter', 'year']
     */
    public static function expiringIn($window, $query = null)
    {
        $now = new Carbon('now');

        $end = $now->addDays(7);

        switch ($window) {

            case 'day':
                $end = $now->addDay();
                break;

            case 'week':
                $end = $now->addDays(7);
                break;

            case 'month':
                $end = $now->addMonth();
                break;

            case 'quarter':
                $end = $now->addMonths(3);
                break;

            case 'year':
                $end = $now->addYear();
                break;

            default:
                throw new \Exception('Time window not recognized, please select between [day, week, month, quarter]');
        }

        if ($query) {

            return $query->where('expire_at', '<', $end)
                ->where('is_expired', 0);
        }

        return Team::where('expire_at', '<', $end)
            ->where('is_expired', '=', 0);
    }


    public function setDeactivatedAtAttribute($value)
    {
        if($value) {
            $this->attributes['deactivated_at'] = Carbon::now();
        }
        else {
            $this->attributes['deactivated_at'] = null;
        }
    }

    public function getInvoiceDetailsAttribute() {
        return $this->toInvoiceDetails();
    }

    /**
     * @param  Builder $query
     * @return mixed
     */
    public function scopeExpired($query)
    {
        return $query->where('expire_at', '<', Carbon::now());
    }

    /**
     *  getIsExpiredAttribute
     */
    public function getIsExpiredAttribute() {

        if (isset($this->attributes['is_expired'])) {

            return $this->attributes['is_expired'];

        } else {

            return false;

        }


    }

    public function getIsBlockedAttribute()
    {
        $user = Auth::user();
        $blockedUsers = $user ? $user->team->blockedTeams : collect();

        if ($blockedUsers->contains('id', $this->id)) {
            return true;
        }

        return false;
    }

    /**
     *  setIsExpiredAttribute
     */
    public function setIsExpiredAttribute($value)
    {

        $original = $this->getOriginal();

        if ($original && $value !== $original['is_expired']) {

            $this->toggleMembers($value);

        }

        return $this->attributes['is_expired'] = $value;
    }

    /**
     *  Get Team's avg rating
     */
    public function getScoreAttribute()
    {
        return round(Feedback::whereIn('owner_id', $this->members->pluck('id'))
            ->get()
            ->avg('rating'), 1);
    }

    /**
     *  Feedback count
     */
    public function getRatingsCountAttribute()
    {
        return Feedback::whereIn('owner_id', $this->members->pluck('id'))->count();
    }

    /**
     *  Bidding ability moved to Team level
     */
    public function canBid()
    {
        return $this->can_bid;
    }

    /**
     *  Grant/revoke Bidding ability to all members
     */
    public function membersCanBid($allowed = false)
    {
        foreach($this->members as $member) {

            if ($allowed && !$member->hasRole('driver')) {

                $member->attachRole(Role::findByName('driver'));

            }

            if (!$allowed && $member->hasRole('driver')) {

                $member->detachRole(Role::findByName('driver'));

            }
        }
    }

    /**
     * Deactivate Team and it's members
     */
    public function deactivate()
    {
        $this->is_expired = true;

        $this->can_bid = false;

        $this->deactivated_at = \Carbon\Carbon::now();

        $this->toggleMembers(true);

        $this->save();
    }

    /**
     * Reinstates Team and it's members
     */
    public function reinstate()
    {
        $this->is_expired = false;

        $this->can_bid = true;

        $this->deactivated_at = null;

        $this->toggleMembers(false);

        $this->save();
    }

    public function toggleMembers($inactive = false)
    {
        foreach($this->members as $member) {

            $member->update(['inactivated' => $inactive]);

        }
    }

    public function removeBids()
    {
        foreach($this->members as $member)
        {
            foreach($member->bids as $bid)
            {
                $bid->delete();
            }
        }

    }
}
