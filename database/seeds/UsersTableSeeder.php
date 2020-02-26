<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder {

	/**
	 * Auto generated seed file
	 *
	 * @return void
	 */
	public function run()
	{
		\DB::table('users')->delete();

		\DB::table('users')->insert(array (
			1 =>
			array (
				'name_first' => 'Doug',
				'name_last' => 'Belchamber',
				'email' => 'doug@smarter.uk.com',
				'password' => '$2y$10$JNBUdNXDiUN8pREnKqoWruB5isIbA9I84ytmi5Ue3e30omox4kE1e',
				'remember_token' => 'jqefF9vGu6h1pn4tKnX1YPodn4RPmyOIYIXuQRcrncU9hexM6TPE8Iqw8Pvg',
				'created_at' => '2015-05-21 13:29:05',
				'updated_at' => '2015-05-27 11:36:33',
				'phone' => '+44 20 7930 1980',
				'avatar' => '',
			),
			2 =>
			array (
				'name_first' => 'Robert',
				'name_last' => 'Bokori',
				'email' => 'robert@smarter.uk.com',
				'password' => '$2y$10$iwkVz0W70UcAaUrP2D1VCuDRG34wR2WXj0NcuBAFPDwpEIqWICUQ6',
				'remember_token' => '3ggtyfMWS97HM6gzf1dTmyGWeahkz1lRT65dpotH17HXbAXs7uPwEDyM3A1P',
				'created_at' => '2015-05-21 13:39:39',
				'updated_at' => '2015-05-25 14:51:26',
				'phone' => '0036445544552',
				'avatar' => '',
			),
			3 =>
			array (
				'name_first' => 'Federico',
				'name_last' => 'Francecsato',
				'email' => 'ffrancescato@gmail.com',
				'password' => bcrypt('d3velopment'),
				'remember_token' => '',
				'created_at' => '2015-05-21 13:29:05',
				'updated_at' => '2015-05-27 11:36:33',
				'phone' => '+44 20 7930 1980',
				'avatar' => '',
			),
		));
	}

}
