<?php

use Illuminate\Database\Seeder;
use Sdcn\Models\Job;
use Sdcn\Models\User;

class RatingsSeeder extends Seeder
{

	public function run()
	{
		$users = User::all();
		foreach($users as $user) {
			foreach($user->jobs as $job) {
				$user->feedbacks()->create([
					'sender_id' => $users->random()->id,
					'job_id' => $job->id,
					'rating' => rand(1, 5),
				]);
			}
		}
	}
}