<?php

use Sdcn\Models\User;
use Faker\Factory as Faker;

class UsersSeeder extends AbstractArraySeeder
{
	protected $items = [
		[   'id' => 1,
			'name_first' => 'Nitin',
			'name_last' => 'Tutlani',
			'email' => 'nitintutlani@yahoo.com',
			'password' => 'nitin',
			'is_admin' => true,
			'address_1' => '68 Sainik Vihar',
			'town' => 'Delhi',
			'postal_code' => '110034',
			'phone' => '9911143111',
		],
		[   'id' => 2,
			'name_first' => 'Doug',
			'name_last' => 'Belchamber',
			'email' => 'doug@smarter.uk.com',
			'password' => 'doug',
			'is_admin' => true,
			'address_1' => 'London',
			'town' => 'London',
			'postal_code' => '12345',
			'phone' => '67890',
		],
	];

	public function __construct(User $model)
	{
		$this->model = $model;
	}

	public function run()
	{
		parent::run();

		$faker = Faker::create();

		foreach(range(4, 11) as $id)
		{
			User::create([
				'name_first' => $faker->firstName,
				'name_last' => $faker->lastName,
				'email' => $faker->email,
				'password' => 'sdcn',
				'company_name' => $faker->company,
				'company_number' => $faker->randomNumber(),
				'vat' => $faker->randomNumber(),
				'address_1' => $faker->streetAddress,
				'address_2' => $faker->buildingNumber,
				'town' => $faker->city,
				'county' => 'BC',
				'postal_code' => $faker->postcode,
				'phone' => $faker->phoneNumber,
			]);
		}

	}
}
