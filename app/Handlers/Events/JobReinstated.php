<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\Job;
use Sdcn\Models\Event;
use Illuminate\Support\Facades\Mail;

class JobReinstated implements ShouldQueue {

    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param  Job  $job
     * @return void
     */
    public function handle(Job $job)
    {

        // job poster
        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Job reinstated",
            "description" => "Job #" . $job->id . " has been reinstated",
            "status" => "new",
            "type" => "trivial"
        ));

        Mail::send('emails.jobs.reinstated', [
            'job' => $job
        ], function ($message) use ($job)
        {
            $message
                ->to($job->user_info['email'], $job->user_info['name_full'])
                ->subject('SDCN - Job #' . $job->id . ' - Has Been Reinstated.');
        });

        // Bidders

        $bids_user = $job->bids()->with('user')->get();

        foreach ($bids_user as $single_bid) {

            Event::forceCreate(array(
                "user_id" => $single_bid->user['id'],
                "name" => "Job reinstated",
                "description" => "Job #" . $job->id . " has been reinstated",
                "status" => "new",
                "type" => "trivial"
            ));

            Mail::send('emails.jobs.reinstated', [
                'job' => $job
            ], function ($message) use ($job, $single_bid)
            {
                $message
                    ->to($single_bid->user['email'], $single_bid->user['name_full'])
                    ->subject('SDCN - Job #' . $job->id . ' - Has Been Reinstated.');
            });
        }
    }
}
