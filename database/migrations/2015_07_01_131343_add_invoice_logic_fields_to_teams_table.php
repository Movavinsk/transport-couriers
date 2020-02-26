<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddInvoiceLogicFieldsToTeamsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('teams', function(Blueprint $table)
		{
            $table->boolean('use_company_address');
            $table->boolean('external_invoice_recipient');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('teams', function(Blueprint $table)
		{
            $table->dropColumn('use_company_address');
            $table->dropColumn('external_invoice_recipient');
		});
	}

}
