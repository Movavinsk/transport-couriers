<?php namespace Sdcn\Handlers\Events;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Team;

class TeamExpiring implements ShouldQueue {

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

        if (! $primary) {
            \Log::info("Primary member for $team->id not found.");
            return;
        }

        if (!$team->alerted) {

            Mail::send('emails.teams.expiring', [
                'team' => $team,
                'primary' => $primary
            ], function ($message) use ($team, $primary)
            {
                $message
                    ->to($primary->email, $primary->name_full)
                    ->subject('Your SDCN membership is about to expire.');
            });

            $team->alerted = true;

            $team->save();
        }

    }
}
