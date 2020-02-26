<?php

use Sdcn\Models\User;
use Sdcn\Models\Job;
use Sdcn\Models\Bid;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class BidsSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$job_ids = Job::lists('id');

		$user_ids = User::lists('id');

		foreach($job_ids as $job_id)
		{
			foreach(range(1, rand(0, 10)) as $cnt)
			{
				Bid::create([
					'job_id' => $job_id,
					'user_id' => $faker->randomElement($user_ids),
					'bid_date' => $faker->dateTimeThisMonth,
					'amount' => rand(10, 100),
					'details' => $faker->sentence(),
				]);
			}
		}
	}
}