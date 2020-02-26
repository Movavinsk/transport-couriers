<?php

use Illuminate\Database\Seeder;

class InvoicesTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('invoices')->delete();
        
		\DB::table('invoices')->insert(array (
			0 => 
			array (
				'job_id' => 1,
				'invoice_date' => '2015-05-25 20:25:57',
				'manual' => 0,
				'amount' => '1500.00',
				'notes' => 'Bla',
				'invoice_number' => '2-112211',
				'external_number' => '',
				'cc' => 'doug@smarter.uk.com',
				'paid' => 0,
				'created_at' => '2015-05-25 20:26:47',
				'updated_at' => '2015-05-25 20:26:47',
			),
		));
	}

}
