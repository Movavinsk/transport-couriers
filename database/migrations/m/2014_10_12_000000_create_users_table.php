<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration {

	const TABLENAME = 'users';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create(self::TABLENAME, function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('name_first');
			$table->string('name_last'); // Last name is optional
			$table->string('email')->unique();
			$table->string('password', 60);
			$table->boolean('is_admin');
			$table->rememberToken();
			$table->timestamps();
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
		Schema::drop(self::TABLENAME);
	}

}
