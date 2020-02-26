<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Job;
use Sdcn\Models\Pod;

class NewPODCreated {

	/**
	 * Handle the event.
	 *
	 * @param  Pod  $pod
	 * @return void
	 */
	public function handle(Pod $pod)
	{
		$job = Job::find($pod->job_id);

        $requester = $job->user_info;

        $driver = $job->bid['user'];

        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "POD uploaded",
            "description" => "POD uploaded for Job: #" . $job->id,
            "status" => "new",
            "type" => "feedback"
        ));

        Event::forceCreate(array(
            "user_id" => $job->bid_user_id,
            "name" => "POD uploaded",
            "description" => "POD uploaded for Job: #" . $job->id,
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::queue('emails.jobs.POD', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($requester, $job)
        {
            $message->to($requester['email'], $requester['name_full'])->subject('SDCN - Job #' . $job->id . ' has Been Delivered');
        });

        Mail::send('emails.jobs.POD-driver', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($driver, $job)
        {
            $message->to($driver['email'], $driver['name_full'])->subject('SDCN - Job #' . $job->id . ' has Been Delivered');
        });
	}

}
