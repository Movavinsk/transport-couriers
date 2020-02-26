<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvoicesTable extends Migration {

	const TABLENAME = 'invoices';

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
			$table->integer('job_id')->unsigned()->index();
			$table->foreign('job_id')->references('id')->on(CreateJobsTable::TABLENAME)->onDelete('cascade');
			$table->datetime('invoice_date');
			$table->boolean('manual')->default(false);
			$table->decimal('amount', 10, 2)->nullable();
			$table->text('notes');
			$table->string('invoice_number');
			$table->string('external_number');
            $table->boolean('paid');
			$table->string('cc');
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
