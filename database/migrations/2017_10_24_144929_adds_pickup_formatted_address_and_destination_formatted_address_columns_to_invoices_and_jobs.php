<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddsPickupFormattedAddressAndDestinationFormattedAddressColumnsToInvoicesAndJobs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('pickup_formatted_address')->nullable();
            $table->string('destination_formatted_address')->nullable();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('pickup_formatted_address')->nullable();
            $table->string('destination_formatted_address')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn('pickup_formatted_address');
            $table->dropColumn('destination_formatted_address');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('pickup_formatted_address');
            $table->dropColumn('destination_formatted_address');
        });
    }
}
