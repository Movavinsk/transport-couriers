<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeStatisticsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('statistics', function($table)
        {
            $table->dropColumn('daily_jobs');
            $table->dropColumn('weekly_jobs');
            $table->dropColumn('monthly_jobs');

            $table->integer('total')->after('id');
            $table->string('type',25)->after('id');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('statistics', function($table)
        {
            $table->dropColumn('total');
            $table->dropColumn('type');

            $table->integer('daily_jobs');
            $table->integer('weekly_jobs');
            $table->integer('monthly_jobs');
        });
	}

}
