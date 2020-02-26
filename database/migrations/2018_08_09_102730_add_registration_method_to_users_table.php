<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddRegistrationMethodToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('registration_status', ['complete', 'incomplete', 'backend'])->default('backend');
            $table->enum('registration_progress', [
                'company',
                'recipient_details',
                'invoice',
                'documents',
                'complete',
                'company_location',
                'invoice_footer_details'
            ])->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('registration_status');
            $table->dropColumn('registration_progress');
        });
    }
}
