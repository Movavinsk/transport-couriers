<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateJobsTable extends Migration {

	const TABLENAME = 'jobs';

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
			$table->bigInteger('user_id')->unsigned()->index();
			$table->foreign('user_id')->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');
			$table->integer('priority');
			$table->string('pickup_point');
			$table->decimal('pickup_longitude', 10, 7)->nullable();
			$table->decimal('pickup_latitude', 10, 7)->nullable();
			$table->datetime('pickup_date');
			$table->string('destination_point');
			$table->decimal('destination_longitude', 10, 7)->nullable();
			$table->decimal('destination_latitude', 10, 7)->nullable();
			$table->datetime('destination_date');
			$table->integer('vehicle_id')->unsigned()->index();
			$table->foreign('vehicle_id')->references('id')->on(CreateVehiclesTable::TABLENAME)->onDelete('cascade');
			$table->text('details')->nullable();
			$table->datetime('expiry_time')->nullable();
			$table->boolean('accept_phone');
			$table->string('phone')->nullable();
			$table->boolean('accept_email');
			$table->string('email')->nullable();
			// Status fields
			$table->string('status')->default('active');
			$table->datetime('status_date')->nullable();
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
