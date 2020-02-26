<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddsDestinationTownAndDestinationPostocdePrefixAndRenamesPostcodePrefixAndTown extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn('postcode_prefix');
            $table->dropColumn('town');
            $table->string('pickup_postcode_prefix', 4)->nullable();
            $table->string('pickup_town', 255)->nullable();
            $table->string('destination_postcode_prefix', 4)->nullable();
            $table->string('destination_town', 255)->nullable();
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
            $table->dropColumn('destination_postcode_prefix');
            $table->dropColumn('destination_town');
            $table->dropColumn('pickup_postcode_prefix');
            $table->dropColumn('pickup_town');
            $table->string('postcode_prefix', 4)->nullable();
            $table->string('town', 255)->nullable();
        });
    }
}
