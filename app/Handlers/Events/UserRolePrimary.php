<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\User;
use Sdcn\Models\Event;
use Illuminate\Support\Facades\Mail;

class UserRolePrimary implements ShouldQueue {

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
            "name" => "You became the Primary Member",
            "description" => "You’re now the primary user for " . $user->team->company_name,
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.user.role-primary', [
            'user' => $user
        ], function ($message) use ($user)
        {
            $message
                ->to($user['email'], $user['name_full'])
                ->subject('You’re now the primary user for ' . $user->team->company_name);
        });
	}

}
