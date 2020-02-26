<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateJobsTableAddBidFields extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table(CreateJobsTable::TABLENAME, function(Blueprint $table)
		{
			// Allocate to bid
			$table->integer('bid_id')->unsigned()->nullable()->index();
			$table->foreign('bid_id')->references('id')->on(CreateBidsTable::TABLENAME)->onDelete('cascade');
			$table->bigInteger('bid_user_id')->unsigned()->nullable()->index();
			$table->foreign('bid_user_id')->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');
			$table->decimal('bid_amount', 10, 2)->nullable();
			$table->boolean('bid_manual');
			$table->text('bid_details')->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table(CreateJobsTable::TABLENAME, function(Blueprint $table)
		{
			$table->dropForeign(['bid_id']);
			$table->dropColumn('bid_id');
		});
	}

}
