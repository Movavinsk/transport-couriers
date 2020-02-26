<?php

namespace Sdcn\Http\Controllers\User;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Repositories\Contracts\BenefitRepositoryInterface;

class BenefitsController extends AbstractController
{

    use ListHelper;

    /**
     * @var BenefitRepositoryInterface
     */
    protected $repo;

    protected $with = ['partner'];

    /**
     * @param BidRepositoryInterface $repo
     */
    public function __construct(BenefitRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }


}