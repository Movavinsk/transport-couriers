<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDeliveryPointsToInvoicesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('invoices', function(Blueprint $table)
		{
            $table->string('pickup_point');
            $table->string('destination_point');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('invoices', function(Blueprint $table)
		{
            $table->dropColumn('pickup_point');
            $table->dropColumn('destination_point');
		});
	}

}
