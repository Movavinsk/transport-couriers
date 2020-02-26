<?php namespace Sdcn\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Sdcn\Models\Team;
use Symfony\Component\Console\Input\InputArgument;

class CheckForExpiringMemberships extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'members:expiring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for memberships expiring in ';

    protected function getArguments()
    {

        return [
            ['window', InputArgument::REQUIRED, 'The time window you would like to inquire.']
        ];

    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {

        $teams = Team::expiringIn($this->argument('window'))
            ->get();

        foreach($teams as $team) {
            \Event::fire('team.expiring', $team);
        };
    }

}
