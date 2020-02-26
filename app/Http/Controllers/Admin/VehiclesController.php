<?php

namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Repositories\Contracts\UserVehiclesRepositoryInterface;

/**
 * Class LocationController
 * @package Sdcn\Http\Controllers
 */
class VehiclesController extends AbstractController
{
    use ListHelper;
    use ShowHelper;
    use StoreHelper;
    use UpdateHelper;
    use DestroyHelper;

    /**
     * @var UserVehiclesRepositoryInterface
     */
    public $repo;

    /**
     * @param UserVehiclesRepositoryInterface $repo
     */
    function __construct(UserVehiclesRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

}
