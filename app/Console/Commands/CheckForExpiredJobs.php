<?php namespace Sdcn\Console\Commands;

use Illuminate\Console\Command;
use Sdcn\Models\Job;

class CheckForExpiredJobs extends Command {

	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'jobs:expired';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Automatically check all jobs, and close the expired ones';


	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function handle()
	{
        $jobs = Job::whereRaw('`status` = "active" AND `expiry_time` < now()')->get();

        foreach($jobs as $job){
            $job->status = "expire";
            $job->save();
        }
	}

}
