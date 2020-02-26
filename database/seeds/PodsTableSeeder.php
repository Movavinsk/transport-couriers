<?php

use Illuminate\Database\Seeder;

class PodsTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('pods')->delete();
        
		\DB::table('pods')->insert(array (
			0 => 
			array (
				'id' => 1,
				'job_id' => 72,
				'recipient' => 'Smarter Trade Ltd',
				'delivery_date' => '2015-05-23 06:00:00',
				'upload' => '/assets/uploads/pods/1.pdf',
				'created_at' => '2015-05-25 20:25:51',
				'updated_at' => '2015-05-25 20:25:51',
			),
			1 => 
			array (
				'id' => 2,
				'job_id' => 71,
				'recipient' => 'Bla',
				'delivery_date' => '2015-05-23 06:00:00',
				'upload' => '/assets/uploads/pods/2.pdf',
				'created_at' => '2015-05-26 15:04:35',
				'updated_at' => '2015-05-26 15:04:35',
			),
			2 => 
			array (
				'id' => 3,
				'job_id' => 74,
				'recipient' => 'Super Trans Ltd.',
				'delivery_date' => '2015-05-28 06:00:00',
				'upload' => '',
				'created_at' => '2015-05-26 20:53:58',
				'updated_at' => '2015-05-26 20:53:58',
			),
		));
	}

}
