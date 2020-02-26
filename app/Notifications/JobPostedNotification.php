<?php

namespace Sdcn\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use Sdcn\Models\Job;
use Sdcn\Services\FcmChannel;


class JobPostedNotification extends Notification
{
    public $job;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Job $job)
    {
        $this->job = $job;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [FcmChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     *
     * @return array
     */
    public function toFCM($notifiable)
    {
        $notificationDistance = config('app.notification_distance');
        $bodyBuilder = new PayloadNotificationBuilder('A new job is available');
        $bodyBuilder->setBody("A new job is available within $notificationDistance miles of you");
        $dataBuilder = new PayloadDataBuilder();
        $dataBuilder->addData([
            'event' => [
                'name' => 'job_available',
                'data' => [
                    'jobId' => $this->job->id,
                ],
            ],
        ]);
        return [$bodyBuilder, $dataBuilder];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
