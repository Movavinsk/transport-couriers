<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNoPodReasonFieldToPodsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('pods', function(Blueprint $table)
		{
            $table->text('no_pod_reason');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('pods', function(Blueprint $table)
		{
			$table->dropColumn('no_pod_reason');
		});
	}

}
