<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\Team;
use Illuminate\Support\Facades\Mail;

class TeamExpired implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  Team  $team
	 * @return void
	 */
	public function handle(Team $team)
	{
        $primary = $team->primaryMember;

        Mail::send('emails.teams.expired', [
            'team' => $team,
            'primary' => $primary
        ], function ($message) use ($team, $primary)
        {
            $message
                ->to($primary->email, $primary->name_full)
                ->subject('Your SDCN membership has expired');
        });
    }
}
