<?php namespace Sdcn\Handlers\Events;

use Sdcn\Models\Event;
use Sdcn\Models\Feedback;

class NewFeedbackAdded {

	public function handle(Feedback $feedback)
	{
		Event::forceCreate([
			'user_id' => $feedback->owner_id,
			'name' => 'Feedback received',
			'description' => 'Feedback received for Job: #'.$feedback->job_id,
			'type' => 'trivial'
		]);

		Event::forceCreate([
			'user_id' => $feedback->sender_id,
			'name' => 'Feedback sent',
			'description' => 'Feedback sent for Job: #'.$feedback->job_id,
            'type' => 'feedback'
		]);
	}
}