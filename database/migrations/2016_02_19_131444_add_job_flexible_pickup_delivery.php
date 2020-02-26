<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddJobFlexiblePickupDelivery extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('jobs', function(Blueprint $table) {
			$table->datetime('pickup_date_end')->nullable();
			$table->boolean('flexible_pickup')->nullable()->default(false);
			$table->datetime('destination_date_end')->nullable();
			$table->boolean('flexible_destination')->nullable()->default(false);
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('jobs', function(Blueprint $table) {
			$table->dropColumn('pickup_date_end');
			$table->dropColumn('flexible_pickup');
			$table->dropColumn('destination_date_end');
			$table->dropColumn('flexible_destination');
		});

	}

}
