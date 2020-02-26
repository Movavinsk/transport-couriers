<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
class AddTypeToMembers extends Migration
{
    public function up()
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('type')->nullable();
        });
    }
    public function down()
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn(['type']);
        });
    }
}