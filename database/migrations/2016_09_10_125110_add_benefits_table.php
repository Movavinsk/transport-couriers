<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBenefitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('benefits', function(Blueprint $table) {
            $table->increments('id');
            $table->text('description');
            $table->integer('partner_id')->unsigned();
            $table->foreign('partner_id')->references('id')->on('partners')->onDelete('cascade');
            $table->string('url');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('benefits');
    }
}
