<?php namespace Sdcn\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Sdcn\Console\Commands\CheckForExpiredTeams;

class Kernel extends ConsoleKernel {

	/**
	 * The Artisan commands provided by your application.
	 *
	 * @var array
	 */
	protected $commands = [
		'Sdcn\Console\Commands\Inspire',
		'Sdcn\Console\Commands\CheckForExpiredJobs',
		'Sdcn\Console\Commands\CheckForExpiredTeams',
		'Sdcn\Console\Commands\CheckForExpiringMemberships'
	];

	/**
	 * Define the application's command schedule.
	 *
	 * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
	 * @return void
	 */
	protected function schedule(Schedule $schedule)
	{
		$schedule->command('jobs:expired')->everyFiveMinutes();
		$schedule->command('app:expired-teams')->everyFiveMinutes();
		$schedule->command('members:expiring '.config('sdcn.members_expiration_check_interval'))->dailyAt('12:00');
	}

}
