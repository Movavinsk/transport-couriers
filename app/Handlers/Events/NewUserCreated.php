<?php namespace Sdcn\Handlers\Events;

use Illuminate\Auth\Passwords\PasswordBroker;
use Sdcn\Models\Role;
use Sdcn\Models\User;

/**
 * Class NewUserCreated
 * @package Sdcn\Handlers\Events
 */
class NewUserCreated {

    /**
     * @param PasswordBroker $passwords
     */
    function __construct(PasswordBroker $passwords)
    {
        $this->passwords = $passwords;
    }

    /**
	 * Handle the event.
	 *
	 * @param  User  $user
	 * @return void
	 */
	public function handle(User $user)
	{
        // store default settings
        $user->settings = ['vehicle_type' => 'all', 'location' => 'location_only'];
        $user->save();

        $this->passwords->sendResetLink(['email'=>$user->email], function($m)
        {
            $m->subject('Welcome to Same Day Courier Network');
        });

	}

}
