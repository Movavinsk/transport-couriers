<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAsapToJobs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('jobs', function(Blueprint $table) {
            $table->boolean('pickup_asap')->default(false);
            $table->boolean('destination_asap')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jobs', function(Blueprint $table) {
            $table->dropColumn('pickup_asap');
            $table->dropColumn('destination_asap');
        });
    }
}
