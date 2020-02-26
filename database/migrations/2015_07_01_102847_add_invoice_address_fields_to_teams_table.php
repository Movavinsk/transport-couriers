<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddInvoiceAddressFieldsToTeamsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('teams', function(Blueprint $table)
		{
            $table->string('invoice_address_line_1');
            $table->string('invoice_address_line_2');
            $table->string('invoice_town');
            $table->string('invoice_county');
            $table->string('invoice_postal_code');
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
            $table->dropColumn('invoice_address_line_1');
            $table->dropColumn('invoice_address_line_2');
            $table->dropColumn('invoice_town');
            $table->dropColumn('invoice_county');
            $table->dropColumn('invoice_postal_code');
		});
	}

}
