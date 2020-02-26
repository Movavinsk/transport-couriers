<?php namespace Sdcn\Handlers\Events;


use Illuminate\Support\Facades\Notification;
use Sdcn\Models\SentJobNotification;
use Sdcn\Notifications\JobPostedNotification;
use Sdcn\Models\Job;

class JobPosted {

    /**
     * Handle the event.
     *
     * @param  Job $job
     * @return void
     */
    public function handle(Job $job)
    {
        if (env('APP_ENV') != 'local' && $job->status == 'active') {
            $notificationDistance = config('app.notification_distance');
            $users = $job->usersWithinSetDistance($notificationDistance);
            Notification::send($users, new JobPostedNotification($job));

            // this logs that the user has been sent the notification to ensure they are not sent it again
            $users->each(function($user) use($job) {
                SentJobNotification::create([
                   'user_id' => $user->id,
                   'job_id' => $job->id,
                ]);
            });
        }
    }
}
