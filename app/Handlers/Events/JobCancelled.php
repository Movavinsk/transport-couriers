<?php namespace Sdcn\Handlers\Events;


use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Job;

class JobCancelled {

    /**
     * Handle the event.
     *
     * @param  Job $job
     * @return void
     */
    public function handle(Job $job)
    {
        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Job cancelled",
            "description" => "Job #" . $job->id . " has been cancelled",
            "status" => "new",
            "type" => "critical"
        ));

        Mail::send('emails.jobs.cancelled', [
            'job' => $job
        ], function ($message) use ($job)
        {
            $message
                ->to($job->user_info['email'], $job->user_info['name_full'])
                ->subject('SDCN - Job #' . $job->id . ' Cancelled');
        });
    }

}
