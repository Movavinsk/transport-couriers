<?php namespace Sdcn\Models;

class Bid extends AbstractModel {

    protected $fillable = [
        'job_id',
        'user_id',
        'bid_date',
        'amount',
        'details',
        'add_vat',
        'manual'
    ];

    protected $appends = ['user', 'is_accepted'];

    protected $with = ['feedback'];

    public function user()
    {
        return $this->belongsTo('\Sdcn\Models\User');
    }

    public function job()
    {
        return $this->belongsTo('\Sdcn\Models\Job');
    }

    public function getUserAttribute()
    {
        return $this->user()->first()->toInfo();
    }

	public function feedback()
	{
		return $this->hasOne('Sdcn\Models\Feedback');
	}

    public function getBidDateAttribute()
    {
        $bid_date = $this->attributes["bid_date"];
        if ( ! ($bid_date instanceof \DateTime)) {
            $bid_date = new \DateTime($bid_date);
        }

        return $bid_date->format('c');
    }

    public function getIsAcceptedAttribute()
    {
        return ($this->job()->first()->bid_user_id && $this->job()->first()->bid_user_id == $this->user_id && $this->id == $this->job()->first()->bid_id);
    }
}