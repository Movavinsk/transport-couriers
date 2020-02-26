<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTeamToDocumentsAndLocation extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('locations', function(Blueprint $table) {

			$table->integer('team_id')->unsigned()->nullable();

		});

		Schema::table('documents', function(Blueprint $table) {

			$table->integer('team_id')->unsigned()->nullable();

		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('locations', function(Blueprint $table) {

			$table->dropColumn('team_id');

		});

		Schema::table('documents', function(Blueprint $table) {

			$table->dropColumn('team_id');

		});
	}

}