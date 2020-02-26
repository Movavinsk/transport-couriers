<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Sdcn\Models\User;

class DatabaseSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Model::unguard();

		$this->call(SettingsSeeder::class);
        $this->call(UsersTableSeeder::class);

        \Auth::login(User::first());

        $this->call(PermissionsSeeder::class);
        $this->call(VehiclesTableSeeder::class);
        $this->call(DocumentTypesTableSeeder::class);
        $this->call(RoleUserTableSeeder::class);
        $this->call(TeamsSeeder::class);

        // jobs
        $this->call(JobsTableSeeder::class);
        $this->call(BidsSeeder::class);
		$this->call(JobsBidsSeeder::class);

//        $this->call(WayPointsTableSeeder::class);
//		$this->call(PodsTableSeeder::class);
//		$this->call(LocationsTableSeeder::class);
//		$this->call(InvoicesTableSeeder::class);
//        $this->call(InvoiceItemsTableSeeder::class);
//
//		$this->call(EventsSeeder::class);
	}
}
