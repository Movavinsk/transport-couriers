<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvoiceItemsTable extends Migration {

	const TABLENAME = 'invoice_items';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create(self::TABLENAME, function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('invoice_id')->unsigned()->index();
			$table->foreign('invoice_id')->references('id')->on(CreateInvoicesTable::TABLENAME)->onDelete('cascade');
			$table->string('item');
			$table->decimal('amount', 10, 2);
			$table->boolean('add_vat');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop(self::TABLENAME);
	}

}
