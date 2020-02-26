<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWayPointsTable extends Migration {

	const TABLENAME = 'way_points';

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
			$table->string('way_point');
			$table->datetime('stopoff_date');
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
