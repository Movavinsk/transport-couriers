<?php

use Carbon\Carbon;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Sdcn\Models\Role;
use Sdcn\Models\Team;
use Sdcn\Models\User;

class TeamsSeeder extends Seeder {

    public function run()
    {
        $team = Team::create([
            'company_name' => "Administrators",
            'company_number' => "000000000",
            'expire_at' => Carbon::now()->addYear(50),
            'billing_frequency' => 30,
            'vat_number' => "000000000",
            'address_line_1' => "4 Purewell",
            'town' => "Christchurch",
            'county' => "County",
            'postal_code' => "BH23 1EP"
        ]);

        foreach(User::all() as $user) {
            $user->update([
                'team_id' => $team->id
            ]);
        }
        User::first()->attachRole(Role::whereName('team.member.primary')->first());
    }
}