<?php

use Sdcn\Models\Job;
use Faker\Factory as Faker;
use Sdcn\Models\User;
use Sdcn\Models\Vehicle;
use Illuminate\Database\Seeder;

class JobsSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$user_ids = User::lists('id');
		$vehicle_ids = Vehicle::lists('id');

		foreach($user_ids as $user_id)
		{
			foreach(range(1, rand($user_id <= 3 ? 10 : 0, 10)) as $cnt)
			{
				Job::create([
					'priority' => rand(1,5),
					'pickup_point' => $faker->streetAddress,
					'pickup_latitude' => rand(50000000, 53000000) / 1000000,
					'pickup_longitude' => -1 * rand(0, 3000000) / 1000000,
					'pickup_date' => $faker->dateTimeThisMonth,
					'destination_point' => $faker->streetAddress,
					'destination_latitude' => rand(50000000, 53000000) / 1000000,
					'destination_longitude' => -1 * rand(0, 3000000) / 1000000,
					'destination_date' => $faker->dateTimeThisMonth,
					'vehicle_id' => $faker->randomElement($vehicle_ids),
					'details' => $faker->sentence(),
					'expiry_time' => $faker->dateTimeThisMonth,
					'accept_phone' => $faker->boolean(),
					'phone' => $faker->randomElement([null, $faker->phoneNumber]),
					'accept_email' => $faker->boolean(),
					'email' => $faker->randomElement([null, $faker->email]),
					'user_id' => $user_id,
					'status' => $faker->randomElement(['active', 'active', 'active', 'active', 'active', 'cancel', 'expire', 'progress', 'complete', 'complete']),
					'status_date' => $faker->dateTimeThisMonth
				]);
			}
		}
	}
}