<?php

use Illuminate\Database\Seeder;

class LocationsTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('locations')->delete();
        
		\DB::table('locations')->insert(array (
			0 => 
			array (
				'user_id' => 1,
				'location' => 'London, UK',
				'latitude' => '51.5073509',
				'longitude' => '-0.1277583',
				'miles' => 50,
				'created_at' => '2015-05-21 13:35:15',
				'updated_at' => '2015-05-26 11:10:18',
			),
			1 => 
			array (
				'user_id' => 2,
				'location' => 'Bournemouth, Bournemouth, Egyesült Királyság',
				'latitude' => '50.7191640',
				'longitude' => '-1.8807690',
				'miles' => 50,
				'created_at' => '2015-05-21 13:40:14',
				'updated_at' => '2015-05-21 13:40:14',
			),
			2 => 
			array (
				'user_id' => 3,
				'location' => 'London, Egyesült Királyság',
				'latitude' => '51.5073509',
				'longitude' => '-0.1277583',
				'miles' => 50,
				'created_at' => '2015-05-21 13:44:52',
				'updated_at' => '2015-05-21 13:44:52',
			),
		));
	}

}
