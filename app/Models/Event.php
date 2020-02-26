<?php namespace Sdcn\Models;

class Event extends AbstractModel
{
	protected $guarded = ['user_id'];
	protected $appends = ['pretty_date'];
	protected $attributes = [
		'status' => 'new',
        'type' => 'trivial'
	];

	public function getPrettyDateAttribute()
	{
		if($this->created_at->diffInHours() < 24) {
			return $this->created_at->diffForHumans();
		}

		return date("d/m/Y g:i:s", strtotime($this->created_at));
	}

	public function setPrettyDateAttribute()
	{
		// ignore any attempt to set the pretty_date attribute
	}
}