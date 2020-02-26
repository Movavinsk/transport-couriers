<?php

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Database\Seeder;
use Sdcn\Models\Job;

class JobsBidsSeeder extends Seeder {

    /**
     * @var Guard
     */
    private $guard;

    public function __construct(Guard $guard)
    {
        $this->guard = $guard;
    }

    public function run()
    {
        $this->guard->loginUsingId(2);
        foreach(Job::whereIn('id', [1,2,4,5])->get() as $job) {
            if($bid = $job->bids()->first()) {
                $job->acceptBid($bid);
            }
        }
    }
}