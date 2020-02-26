<?php

use Sdcn\Models\User;
use Sdcn\Models\Location;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class LocationsSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$user_ids = User::lists('id');

		foreach($user_ids as $user_id)
		{
			foreach(range(1, rand(0, 3)) as $cnt)
			{
				Location::create([
					'user_id' => $user_id,
					'location' => $faker->address,
					'latitude' => rand(50000000, 53000000) / 1000000,
					'longitude' => -1 * rand(0, 3000000) / 1000000,
					'miles' => rand(10, 100),
				]);
			}
		}
	}
}