<?php

namespace Sdcn\Services;

use Illuminate\Notifications\Notification;
use LaravelFCM\Facades\FCM;
use LaravelFCM\Message\OptionsBuilder;

class FcmChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed                                  $notifiable
     * @param  \Illuminate\Notifications\Notification $notification
     *
     * @return void
     * @throws \Exception
     */
    public function send($notifiable, Notification $notification)
    {
        if (!$notifiable->fcm_token) {
            return;
        }

        list($body, $data) = $notification->toFcm($notifiable);

        $optionBuilder = new OptionsBuilder();
        $optionBuilder->setTimeToLive(60 * 20);

        $downstreamResponse = FCM::sendTo($notifiable->fcm_token, $optionBuilder->build(), $body->build(), $data->build());
    }
}