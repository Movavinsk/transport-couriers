<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\Job;
use Sdcn\Models\Event;
use Illuminate\Support\Facades\Mail;

class JobExpired implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  Job  $job
	 * @return void
	 */
	public function handle(Job $job)
	{
        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Job expired",
            "description" => "Job #" . $job->id . " has been expired without being allocated",
            "status" => "new",
            "type" => "trivial"
        ));

        Mail::send('emails.jobs.expired', [
            'job' => $job
        ], function ($message) use ($job)
        {
            $message
                ->to($job->user_info['email'], $job->user_info['name_full'])
                ->subject('SDCN - Job #' . $job->id . ' - Expired Without Being Allocated');
        });
	}
}
