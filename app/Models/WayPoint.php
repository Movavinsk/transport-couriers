<?php namespace Sdcn\Models;

class WayPoint extends AbstractModel
{
	protected $fillable = [
		'job_id',
		'way_point',
		'stopoff_date',
	];

	public function getStopoffDateAttribute()
	{
		return (new \DateTime($this->attributes["stopoff_date"]))->format('c');
	}


}