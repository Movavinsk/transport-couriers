<?php

use Illuminate\Database\Seeder;

class InvoiceItemsTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('invoice_items')->delete();
        
		\DB::table('invoice_items')->insert(array (
			0 => 
			array (
				'invoice_id' => 1,
				'item' => 'Item 1',
				'amount' => '200.00',
				'add_vat' => 1,
				'created_at' => '2015-05-25 20:26:47',
				'updated_at' => '2015-05-25 20:26:47',
			),
			1 => 
			array (
				'invoice_id' => 1,
				'item' => 'Item 2',
				'amount' => '300.00',
				'add_vat' => 0,
				'created_at' => '2015-05-25 20:26:47',
				'updated_at' => '2015-05-25 20:26:47',
			),
		));
	}

}
