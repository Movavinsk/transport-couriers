<?php namespace Sdcn\Models;

use Carbon\Carbon;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Models\Values\InvoiceRecipient;
use Sdcn\Notifications\CompleteRegistrationNotification;
use Sdcn\Notifications\JobPostedNotification;
use Sdcn\Notifications\ResetPasswordNotification  as ResetPasswordNotification;
use Zizaco\Entrust\Traits\EntrustUserTrait;
use Sdcn\Models\Vehicles;

/**
 * @property Collection $feedbacks
 * @property Team $team
 */
class User extends AbstractModel implements AuthenticatableContract, CanResetPasswordContract
{

    use Authenticatable, CanResetPassword, EntrustUserTrait , Notifiable;

    protected $with = ['feedbacks', 'oauthClient'];

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     *
     */
    protected $casts = [
        'settings' => 'object',
        'can_use_client_api' => 'boolean'
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name_first',
        'name_last',
        'email',
        'password',
        'phone',
        'avatar',
        'roles_ids',
        'payment_method',
        'billing_frequency',
        'subscription_amount',
        'team_id',
        'inactivated',
        'settings',
        'can_use_client_api',
    ];

    protected $appends = [
        'name_full',
        'team_role',
        'score',
        'ratings_count',
        'avatar_url',
        'roles_ids',
        'is_admin',
        'is_driver',
        'team_info'
    ];

    protected $toCustomArrayFields = [
        'info' => [
            'id',
            'name_first',
            'name_last',
            'name_full',
            'email',
            'phone',
            'avatar_url',
            'score',
            'team_info',
            'ratings_count'
        ]
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];

    public $temp_roles_ids = [];

    protected static function boot()
    {
        parent::boot();

        self::saving(function($user) {
            if ($user->can_use_client_api == true && $user->oauth_client_id == null) {
                $user->createNewApiClient();
            }
        });
    }

    public static function getAuthenticatedApiUser()
    {
        if (!Auth::user()) {
            return self::where('oauth_client_id', Authorizer::getResourceOwnerId())->first();
        }
    }

    public function getAvatarUrlAttribute()
    {
        if ((bool)$this->avatar) {
            return $this->avatar;
        } else {
            return action('UserController@avatar', [$this->id]);
        }
    }

    public function getIsAdminAttribute()
    {
        return (bool)$this->hasRole('admin');
    }

    public function setIsAdminAttribute()
    {
        return;
    }

    public function getIsDriverAttribute()
    {
        return (bool)$this->hasRole('driver');
    }

    public function setIsDriverAttribute()
    {
        return;
    }

    public function getScoreAttribute()
    {
        if ($this->feedbacks->isEmpty()) {
            return 0;
        }

        return $this->feedbacks->sum('rating') / $this->feedbacks->count();
    }

    public function getRatingsCountAttribute()
    {
        return $this->feedbacks->count();
    }

    public function getRolesIdsAttribute()
    {
        return $this->roles->pluck('id');
    }

    public function setRolesIdsAttribute(array $ids)
    {
        $this->temp_roles_ids = $ids;
    }

    public function oauthClient()
    {
        return $this->belongsTo(OauthClient::class);
    }

    public function cleanTrashablePrimaryMembers()
    {
        $primary = Role::whereName('team.member.primary')->first();

        if (!$this->team) {
            return;
        }

        $members = $this->team->members()->pluck('id');

        $query = RoleUser::whereRoleId($primary->id)->whereIn('user_id', $members)->orderBy('id', 'desc');

        // if the team have one or more primary members
        if ($firstRole = with(clone $query)->first()) {
            $query->where('id', '!=', $firstRole->id)->delete();
        }
    }

    public function getCompanyNameAttribute()
    {
        return $this->team->company_name;
    }


    /**
     * Backwards compatibility.
     *
     * @return bool
     */
    public function getAddVatAttribute()
    {
        return $this->team->invoice_options->isIncludingVat();
    }

    /**
     * Encrypt password
     *
     * @param $password
     * @return void
     */
    public function setPasswordAttribute($password)
    {
        if (strlen($password) > 0) {
            $this->attributes['password'] = bcrypt($password);
        }
    }

    public function getNameFullAttribute()
    {
        return $this->name_first . ' ' . $this->name_last;
    }

    public function locations()
    {
        return $this->hasMany('Sdcn\Models\Location');
    }

    public function documents()
    {
        return $this->hasMany('Sdcn\Models\Document');
    }

    public function feedbacks()
    {
        return $this->hasMany('Sdcn\Models\Feedback', 'owner_id');
    }

    public function jobs()
    {
        return $this->hasMany('Sdcn\Models\Job');
    }

    public function sentJobNotifications()
    {
        return $this->hasMany(SentJobNotification::class);
    }

    public function isTeammate(User $user)
    {
        return $this->team_id && $this->team_id === $user->team_id;
    }

    public function vehicles()
    {
        return $this->belongsToMany(Vehicle::class);
    }

    /**
     * This method return the colleagues ids without the id of the current user.
     */
    public function getColleaguesIds()
    {
        $colleagues = $this->team_id ? $this->team->getMembersIds()->toArray() : [];

        return array_diff($colleagues, [$this->id]);
    }

    public function instantiateInvoiceRecipient()
    {
        return new InvoiceRecipient($this->name_full, $this->email, $this->phone);
    }

    public function team()
    {
        return $this->belongsTo('Sdcn\Models\Team');
    }

    public function bids()
    {
        return $this->hasMany('Sdcn\Models\Bid');
    }

    public function getTeamInfoAttribute()
    {
        $team = $this->team()->first();
        return $team ? $team->toInfo() : null;
    }

    public function isDeactivated()
    {
        return $this->inactivated || ($this->team && $this->team->deactivated_at);
    }

    public function deactivationTarget()
    {
        if (!$this->isDeactivated()) {
            return;
        }

        return $this->inactivated ? 'account' : 'team';
    }

    public function getTeamRoleAttribute()
    {
        return $this->hasRole('team.member.primary') ? 'primary' : 'member';
    }

    /**
     * Announce colleagues network by some event.
     */
    public function announceNetwork($eventAttributes)
    {
        $network = array_merge([$this->id], $this->getColleaguesIds());
        foreach ($network as $user_id) {
            Event::forceCreate($eventAttributes + compact('user_id'));
        }
    }

    /**
     * If it's the primary user then return the entire them, otherwise just him
     */
    public function subordinates()
    {
        if ($this->hasRole('team.member.primary')) {
            return array_merge($this->getColleaguesIds(), [$this->id]);
        }

        return [$this->id];
    }

    /**
     * Used when a new user is added and he doesn't belongs to a team.
     */
    public function createInitialTeam()
    {
        return $this->team()->create([

        ]);
    }

    /**
     * Get list of Admins
     */
    public function scopeAdmins(Builder $query)
    {
        $role_id = Role::byName('admin')->firstOrFail()->id;

        $admins = \DB::table('role_user')->where('role_id', '=', $role_id)->pluck('user_id');

        return $query->whereIn('id', $admins);
    }

    /**
     * Fetch users by setting
     * @TODO either bump laravel to 5.2 and mysql to 5.7 (json queries support) or move settings to a separate table and put a join
     */
    public function scopeBySetting(Builder $query, $setting_name, $setting_value)
    {
        $query_string = '%"' . $setting_name . '":"' . $setting_value . '"%';

        return $query->orWhere('settings', 'like', $query_string);
    }

    /*
     * Check users documents are valid.
     */
    public function documentsValid()
    {
        /*
         * Check if:
         * Goods in transit,
         * Vehicle insurance
         *
         * are within the expiry date of the documents.
         */
        $goodInTransit = $this->checkExpiryDateIsValid(Document::GOODS_IN_TRANSIT_TYPE_ID);
        $vehicleFleetInsurance = $this->checkExpiryDateIsValid(Document::FLEET_OR_VEHICLE_INSURANCE_TYPE_ID);

        return ($goodInTransit && $vehicleFleetInsurance) ? true : false;
    }

    public function checkExpiryDateIsValid($docId)
    {
        $model = $this->documents()->where('type_id', $docId)->orderBy('expiry', 'desc')->first();
        return $model && Carbon::today()->lte($model->expiry);
    }

    public function createNewApiClient()
    {
        $oauthClient = new OauthClient();
        $oauthClient->id = 'user_id:' . $this->id;
        $oauthClient->secret = Str::random(32);
        $oauthClient->name = $this->name_first . ' ' . $this->name_last;
        $oauthClient->save();

        $this->oauth_client_id = $oauthClient->id;
        $this->save();
    }

    public function sendNotificationForJobsInArea()
    {
        $point = new EarthPoint($this->last_latitude, $this->last_longitude);

        $jobs = Job::query()->nearbyJobs($point)
            ->whereDoesntHave('sentNotifications', function ($query) {
                $query->where('user_id', $this->id);
            })->get();

        $jobs->each(function ($job) {
            Notification::send($this, new JobPostedNotification($job));
            SentJobNotification::create(['user_id' => $this->id, 'job_id' => $job->id,]);
        });
    }

    public function sendPasswordResetNotification($token)
    {
        if($this->password) {
            $this->notify(new ResetPasswordNotification($token));
        }else{
            $this->notify(new CompleteRegistrationNotification($token));
        }
    }
}