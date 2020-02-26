<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Job;

class JobClosed {

	/**
	 * Handle the event.
	 *
	 * @param  Job  $job
	 * @return void
	 */
	public function handle(Job $job)
	{
        $requester = $job->user_info;

        $driver = $job['bid']['user'];

        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Job completed",
            "description" => "Job #" . $job->id . "has been completed",
            "status" => "new",
            "type" => "feedback"
        ));

        Event::forceCreate(array(
            "user_id" => $job["bid"]["user_id"],
            "name" => "Job completed",
            "description" => "Job #" . $job->id . "has been completed",
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.jobs.closed-requester', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($requester, $driver, $job)
        {
            $message->to($requester['email'], $requester['name_full'])->subject('SDCN - Job #' . $job->id . ' is Now Complete');
        });

        Mail::send('emails.jobs.closed-driver', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($requester, $driver, $job)
        {
            $message->to($driver['email'], $driver['name_full'])->subject('SDCN - Job #' . $job->id . ' is Now Complete');
        });
	}

}
