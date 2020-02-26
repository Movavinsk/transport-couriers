<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\User;
use Sdcn\Models\Event;
use Illuminate\Support\Facades\Mail;

class UserRoleDriver implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  User  $user
	 * @return void
	 */
	public function handle(User $user)
	{
        Event::forceCreate(array(
            "user_id" => $user->id,
            "name" => "Membership activated",
            "description" => "Your SDCN membership has been fully activated",
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.user.role-driver', [
            'user' => $user
        ], function ($message) use ($user)
        {
            $message
                ->to($user['email'], $user['name_full'])
                ->subject('Your SDCN membership has been fully activated');
        });
	}

}
