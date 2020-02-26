<?php namespace Sdcn\Models;

use Sdcn\Models\User;

/**
 * Keep in mind that a feedback left to the job's owner shouldn't be associated with any bid.
 *
 * @see Job::feedback Is associated only with the respective job and bid_id is null.
 * @see Bid::feedback Is associated with both of the job and the bid.
 *
 * @property  Team  $owner
 * @property  User  $sender
 */
class Feedback extends AbstractModel {

	protected $table = "feedbacks";
	protected $guarded = [];

	public function owner()
	{
        return $this->belongsTo('Sdcn\Models\User');
		// return $this->belongsTo('Sdcn\Models\Team');
	}

	public function sender()
	{
		return $this->belongsTo('Sdcn\Models\User');
	}

	public function job()
	{
		return $this->belongsTo('Sdcn\Models\Job');
	}

    public function bid()
    {
        return $this->belongsTo('Sdcn\Models\Bid');
    }
}