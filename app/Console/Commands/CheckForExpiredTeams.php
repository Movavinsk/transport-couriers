<?php namespace Sdcn\Console\Commands;

use Illuminate\Console\Command;
use Sdcn\Models\Team;
use Illuminate\Support\Facades\Event;

class CheckForExpiredTeams extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'app:expired-teams';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically check all teams, and update the expired ones';


    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $teams = Team::whereRaw('`expire_at` < now() and `is_expired`=0')->get();

        foreach($teams as $team){

            $team->deactivate();

            Event::fire('team.expired', $team);
        }
    }
}
