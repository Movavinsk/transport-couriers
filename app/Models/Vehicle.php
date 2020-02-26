<?php

namespace Sdcn\Models;

use Sdcn\Models\User;
use Illuminate\Database\Eloquent\Builder;

class Vehicle extends AbstractModel
{
	protected $fillable = [
		'name',
		'icon',
		'sort_no',
	];

	public $timestamps = false;

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function scopeSmallerThan(Builder $query, Vehicle $vehicle)
    {
        return $query->where('size', '<=', $vehicle->size)->get();
    }

    public function scopeSizeBetween(Builder $query, Vehicle $vehicle_start, Vehicle $vehicle_end)
    {
        return $query
            ->where('size', '>=', $vehicle_start->size)
            ->where('size', '<=', $vehicle_end->size);
    }

}
