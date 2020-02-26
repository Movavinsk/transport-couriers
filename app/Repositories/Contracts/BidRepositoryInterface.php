<?php namespace Sdcn\Repositories\Contracts;

use Sdcn\Models\Bid;
use Sdcn\Models\User;

interface BidRepositoryInterface extends AbstractRepositoryInterface
{

    public function retract(Bid $bid, User $user);
}
