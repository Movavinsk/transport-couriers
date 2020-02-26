<?php

use Illuminate\Database\Seeder;
use Sdcn\Models\Event;
use Sdcn\Models\User;
use Faker\Factory as Faker;

class EventsSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();


		foreach(User::all() as $user) {
			foreach(range(1,5) as $i) {
				$attributes = [
					'user_id' => $user->id,
					'name' => $faker->sentence(4),
					'description' => $faker->paragraph(),
					'status' => $faker->randomElement(['new', 'read']),
					'type' => $faker->randomElement(['trivial', 'major', 'critical'])
				];

				Event::create($attributes);
			}
		}

	}
}