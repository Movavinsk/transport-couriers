<?php

use Sdcn\Models\Job;
use Sdcn\Models\WayPoint;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class WayPointsSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$job_ids = Job::lists('id');

		foreach($job_ids as $job_id)
		{
			foreach(range(1, rand(0, 2)) as $cnt)
			{
				WayPoint::create([
					'job_id' => $job_id,
					'way_point' => $faker->streetAddress,
					'stopoff_date' => $faker->dateTimeThisMonth,
				]);
			}
		}
	}
}