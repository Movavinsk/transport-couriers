<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateFeedbacksTable extends Migration {

	const TABLENAME = 'feedbacks';

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create(self::TABLENAME, function(Blueprint $table) {
			$table->increments('id');


			$table->unsignedInteger('job_id')->index()->references('id')->on(CreateJobsTable::TABLENAME)->onDelete('cascade');
			$table->unsignedInteger('bid_id')->index()->nullable()->references('id')->on(CreateBidsTable::TABLENAME)->onDelete('cascade');
			$table->tinyInteger('rating');
			$table->text('comment');
			$table->timestamps();

			// I'm commenting this constraint in order to allow jobs with the same bidder as the job owner.
			// $table->unique(['sender_id', 'owner_id', 'job_id']);
            $table->BigInteger('owner_id')->unsigned()->nullable()->index();
			$table->foreign('owner_id')->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');
            $table->BigInteger('sender_id')->unsigned()->nullable()->index();
            $table->foreign('sender_id')->references('id')->on(CreateUsersTable::TABLENAME)->onDelete('cascade');;
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
