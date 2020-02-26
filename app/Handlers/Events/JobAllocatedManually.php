<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\Job;
use Sdcn\Models\Bid;
use Sdcn\Models\Event;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\User;

class JobAllocatedManually implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  Bid  $bid
	 * @return void
	 */
	public function handle(Bid $bid)
	{
        $job = Job::find($bid->job_id);

        $requester = User::find($job->user_id);

        $driver = User::find($bid->user_id);

        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Job allocated",
            "description" => "Job #" . $job->id . " successfully allocated",
            "status" => "new",
            "type" => "feedback"
        ));

        Event::forceCreate(array(
            "user_id" => $driver->id,
            "name" => "Job allocated",
            "description" => "You have been allocated job #" . $job->id . " by " . $requester->team->company_name,
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.jobs.allocated-requester', [
            'job' => $job,
            'requester' => $requester,
            'driver' => $driver
        ], function ($message) use ($job, $requester, $driver)
        {
            $message
                ->to($requester['email'], $requester['name_full'])
                ->subject('Job #' . $job->id . ' Successfully Allocated');
        });

        Mail::queue('emails.jobs.allocated-driver', [
            'job' => $job,
            'requester' => $requester,
            'driver' => $driver
        ], function ($message) use ($job, $requester, $driver)
        {
            $message
                ->to($driver['email'], $driver['name_full'])
                ->subject('SDCN - Job #' . $job->id . ' Has Been Allocated to You');
        });
    }

}
