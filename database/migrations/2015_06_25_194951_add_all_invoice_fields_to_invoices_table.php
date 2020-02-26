<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAllInvoiceFieldsToInvoicesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('invoices', function(Blueprint $table)
		{
			$table->string('to_company');
			$table->string('to_address_line_1');
			$table->string('to_address_line_2');
			$table->string('to_town');
			$table->string('to_county');
			$table->string('to_postal_code');
            $table->string('from_logo');
            $table->string('from_company');
            $table->string('from_address_line_1');
            $table->string('from_address_line_2');
            $table->string('from_town');
            $table->string('from_county');
            $table->string('from_postal_code');
            $table->string('from_email');
            $table->string('from_phone');
            $table->boolean('add_vat');
            $table->text('invoice_footer');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('invoices', function(Blueprint $table)
		{
            $table->dropColumn('to_company');
            $table->dropColumn('to_address_line_1');
            $table->dropColumn('to_address_line_2');
            $table->dropColumn('to_town');
            $table->dropColumn('to_county');
            $table->dropColumn('to_postal_code');
            $table->dropColumn('from_logo');
            $table->dropColumn('from_company');
            $table->dropColumn('from_address_line_1');
            $table->dropColumn('from_address_line_2');
            $table->dropColumn('from_town');
            $table->dropColumn('from_county');
            $table->dropColumn('from_postal_code');
            $table->dropColumn('from_email');
            $table->dropColumn('from_phone');
            $table->dropColumn('add_vat');
            $table->dropColumn('invoice_footer');
		});
	}

}
