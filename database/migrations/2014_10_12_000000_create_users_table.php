<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    const TABLENAME = 'users';

    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            //--from 5.3
            //$table->increments('id');
            $table->string('name_first');
            $table->string('name_last'); // Last name is optional
            //$table->string('email')->unique();
            //$table->string('password', 60);
            $table->boolean('is_admin');
            //$table->rememberToken();
            //$table->timestamps();
            $table->string('phone');
            $table->string('avatar');
            $table->string('payment_method');
            $table->string('billing_frequency');
            $table->integer('subscription_amount');
            $table->unsignedInteger('team_id')->references('id')->on(CreateTeamsTable::TABLENAME)->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
