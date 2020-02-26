<?php namespace Sdcn\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Sdcn\Models\Statistic;
use Sdcn\Models\User;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class CheckDailyCreatedUsers extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'users:daily-created';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for created users in the past 24 hours.';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function fire()
    {
        $yesterday = Carbon::now()->subDay(1);

        $usersToday = User::where('created_at','>',$yesterday)->count();

        $statistics = Statistic::create([
            'type'=>'user',
            'total'=>$usersToday
        ]);

        $this->info($usersToday . ' users created today');
    }

}
