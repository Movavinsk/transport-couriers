<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class AddNameFirstIndexToUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table(CreateUsersTable::TABLENAME, function(Blueprint $table) {
            $table->index('name_first');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table(CreateUsersTable::TABLENAME, function(Blueprint $table) {});
	}

}
