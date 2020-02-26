<?php namespace Sdcn\Models;

use Sdcn\Models\User;
use Sdcn\Models\Team;
use Illuminate\Database\Eloquent\Builder;
use Sdcn\Models\Scopes\Haversine;
use Sdcn\Models\Values\EarthPoint;
use Sdcn\Models\Values\EarthRange;

class Location extends AbstractModel
{
	protected $fillable = [
		'user_id',
        'team_id',
		'location',
		'latitude',
		'longitude',
		'miles',
	];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->getQuery()
            ->join('users', 'users.id', '=', 'locations.user_id')
            ->join('teams', 'teams.id', '=', 'users.id');
    }

    public function scopePointLocatedWithin(Builder $query, EarthPoint $within, $range, $boolean = 'and')
    {
        $harvesine = new Haversine('latitude', 'longitude');
        $harvesine->applyDistanceConstraints($query, $within->latitude, $within->longitude, $range, $boolean);
    }
}