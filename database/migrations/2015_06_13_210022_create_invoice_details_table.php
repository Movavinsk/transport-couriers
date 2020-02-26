<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInvoiceDetailsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		\Schema::create('invoice_details', function(Blueprint $table) {
            $table->string('invoiceable_options_type');
            $table->unsignedInteger('invoiceable_options_id');
            $table->primary(['invoiceable_options_type', 'invoiceable_options_id'], 'invoiceable_options_primary');

            $table->unsignedInteger('recipient_id')->nullable()->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');
            $table->string('recipient_name');
            $table->string('recipient_email');
            $table->string('recipient_phone');
            $table->text('footer_text');
            $table->boolean('includes_vat');
        });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		\Schema::drop('invoice_details');
	}

}
