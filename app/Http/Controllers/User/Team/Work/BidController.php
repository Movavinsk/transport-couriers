<?php namespace Sdcn\Http\Controllers\User\Team\Work;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Requests\Team\Work\Bid\RetractRequest;
use Sdcn\Models\Bid;
use Sdcn\Models\Job;
use Sdcn\Repositories\Contracts\BidRepositoryInterface;

class BidController extends AbstractController {

    /**
     * @var BidRepositoryInterface
     */
    protected $repo;

    /**
     * @var Guard
     */
    protected $guard;

    public function __construct(BidRepositoryInterface $repo, Guard $guard)
    {
        $this->repo = $repo;
        $this->guard = $guard;
    }

    public function retract(RetractRequest $request, Job $job, Bid $bid)
    {
        $this->repo->retract($bid, $this->guard->user());
    }
}
