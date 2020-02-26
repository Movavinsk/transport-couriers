<?php

use Sdcn\Models\Job;
use Sdcn\Models\Pod;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class PodsSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$job_ids = Job::lists('id');

		foreach($job_ids as $job_id)
		{
			foreach(range(1, rand(0, 2)) as $cnt)
			{
				Pod::create([
					'job_id' => $job_id,
					'recipient' => $faker->firstName,
					'delivery_date' => $faker->dateTimeThisMonth,
					'upload' => '/assets/uploads/pods/1.jpg', // Dummy image
				]);
			}
		}
	}
}