<?php

use Illuminate\Database\Seeder;

class VehiclesTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('vehicles')->delete();
        
		\DB::table('vehicles')->insert(array (
			0 => 
			array (
				'id' => 5,
				'name' => 'Bike',
				'icon' => '/assets/uploads/vehicles/5.svg',
				'sort_no' => 1,
			),
			1 => 
			array (
				'id' => 6,
				'name' => 'Small Van',
				'icon' => '/assets/uploads/vehicles/6.svg',
				'sort_no' => 1,
			),
			2 => 
			array (
				'id' => 7,
				'name' => 'SWB Van',
				'icon' => '/assets/uploads/vehicles/7.svg',
				'sort_no' => 3,
			),
			3 => 
			array (
				'id' => 8,
				'name' => 'XLWB Van',
				'icon' => '/assets/uploads/vehicles/8.svg',
				'sort_no' => 4,
			),
			4 => 
			array (
				'id' => 9,
				'name' => 'Luton Van',
				'icon' => '/assets/uploads/vehicles/9.svg',
				'sort_no' => 5,
			),
			5 => 
			array (
				'id' => 10,
				'name' => 'LGV 1',
				'icon' => '/assets/uploads/vehicles/10.svg',
				'sort_no' => 7,
			),
			6 => 
			array (
				'id' => 11,
				'name' => '75T',
				'icon' => '/assets/uploads/vehicles/11.svg',
				'sort_no' => 6,
			),
            7 =>
            array (
                'id' => 12,
                'name' => 'LGV 2',
                'icon' => '/assets/uploads/vehicles/12.svg',
                'sort_no' => 8,
            ),
		));
	}

}
