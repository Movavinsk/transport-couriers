<?php namespace Sdcn\Handlers\Events;

use Mail;
use Sdcn\Models\Job;
use Sdcn\Models\Setting;

class SendPostJobConfirmation {

	/**
	 * Create the event handler.
	 *
	 * @return void
	 */
	public function __construct()
	{
	}

	/**
	 * Handle the event.
	 *
	 * @param  Job  $job
	 * @return void
	 */
	public function handle(Job $job)
	{
        Mail::send('emails.jobs.post-job', ['job' => $job ], function($message) use ($job)
        {
            $message->from(Setting::find('mail_from_email')->value, Setting::find('mail_from_name')->value);
            $message->to($job->getContactEmailAttribute())->subject("SDCN - You posted a new job!");
        });
	}

}
