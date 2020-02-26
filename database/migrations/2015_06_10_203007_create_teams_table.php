<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTeamsTable extends Migration
{
	const TABLENAME = 'teams';

    /**
     * Run the migrations.
     *
     * @return voids
     */
    public function up()
    {
        Schema::create(self::TABLENAME, function(Blueprint $table) {
            $table->increments('id');
            $table->string('company_name');
            $table->string('company_number');
            $table->string('vat_number');
            $table->string('address_line_1');
            $table->string('address_line_2');
            $table->string('town');
            $table->string('county');
            $table->string('postal_code');
            $table->double('subscription_amount');
            $table->string('payment_method');
            $table->integer('billing_frequency');
            $table->datetime('expire_at');
            $table->integer('invoice_recipient_id')->unsigned()->nullable()->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');
            $table->string('invoice_recipient_name');
            $table->string('invoice_recipient_email');
            $table->string('invoice_recipient_phone');
            $table->string('invoice_logo');
            $table->text('invoice_footer_text');
            $table->boolean('invoice_including_vat');
            $table->dateTime('deactivated_at')->nullable();
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
