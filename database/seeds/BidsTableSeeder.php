<?php

use Illuminate\Database\Seeder;

class BidsTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('bids')->delete();
        
		\DB::table('bids')->insert(array (
			0 => 
			array (
				'job_id' => 1,
				'user_id' => 2,
				'bid_date' => '2015-05-21 16:10:00',
				'amount' => '1500.00',
				'details' => 'Bid notes here!',
				'created_at' => '2015-05-21 16:10:41',
				'updated_at' => '2015-05-21 16:10:41',
			),
			1 => 
			array (
				'job_id' => 2,
				'user_id' => 2,
				'bid_date' => '2015-05-26 15:03:47',
				'amount' => '2000.00',
				'details' => 'Notee',
				'created_at' => '2015-05-26 15:03:55',
				'updated_at' => '2015-05-26 15:03:55',
			),
			2 => 
			array (
				'job_id' => 3,
				'user_id' => 3,
				'bid_date' => '2015-05-26 20:43:06',
				'amount' => '1200.00',
				'details' => '',
				'created_at' => '2015-05-26 20:43:10',
				'updated_at' => '2015-05-26 20:43:10',
			),
			3 => 
			array (
				'job_id' => 2,
				'user_id' => 2,
				'bid_date' => '2015-05-26 21:20:18',
				'amount' => '670.00',
				'details' => '',
				'created_at' => '2015-05-26 21:20:23',
				'updated_at' => '2015-05-26 21:20:23',
			),
		));
	}

}
