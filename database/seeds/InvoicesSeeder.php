<?php

use Sdcn\Models\Job;
use Sdcn\Models\Invoice;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class InvoicesSeeder extends Seeder
{
	public function run()
	{
		$faker = Faker::create();

		$job_ids = Job::where('status', 'complete')->pluck('id');

		foreach($job_ids as $job_id)
		{
			foreach(range(1, rand(0, 1)) as $cnt)
			{
				Invoice::create([
					'job_id' => $job_id,
					'invoice_date' => $faker->dateTimeThisMonth,
					'manual' => false,
					'amount' => rand(50, 200),
					'notes' => $faker->sentence(),
					'invoice_number' => 'INV0' . rand(1,100),
					'cc' => $faker->email,
				]);
			}
		}
	}
}
