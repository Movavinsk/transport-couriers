<?php namespace Sdcn\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Sdcn\Models\Job;
use Sdcn\Models\Statistic;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class CheckDailyCreatedJobs extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'jobs:daily-created';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Check for jobs created in the past 24 hours.';

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
        $yesterday = Carbon::now()->subDay(1);

        $jobsToday = Job::where('created_at','>',$yesterday)->count();

        $statistics = Statistic::create([
            'type'=>'job',
            'total'=>$jobsToday
        ]);

        $this->info($jobsToday . ' jobs created today');
	}

}
