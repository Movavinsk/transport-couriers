<?php

use Illuminate\Database\Seeder;
use Sdcn\Models\Permission;
use Sdcn\Models\Role;

class PermissionsSeeder extends Seeder {

    public function run()
    {
        $admin = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Full rights'
        ]);

        $teamPrimary = Role::create([
            'name' => 'team.member.primary',
            'display_name' => 'Primary Member',
            'description' => 'Manage the team members'
        ]);

        $bidder = Role::create([
            'name' => 'driver',
            'display_name' => 'Driver',
            'description' => 'Ability to bid on jobs'
        ]);

        $user = Role::create([
            'name' => 'user',
            'display_name' => 'User',
            'description' => 'Can browse and post jobs'
        ]);

        $addBid = Permission::create([
            'name' => 'add-bid',
            'display_name' => 'Add Bid',
            'description' => 'Ability to add new bid'
        ]);

        $bidder->attachPermission($addBid);
    }
}