<?php

namespace Sdcn\Http\Controllers\Directory;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Repositories\Contracts\TeamLocationsRepositoryInterface;
use Illuminate\Http\Request;

class LocationsController extends AbstractController {

    use ListHelper;

    /**
     * @var TeamLocationsRepositoryInterface
     */
    public $repo;

    /**
     * @param TeamLocationsRepositoryInterface $repo
     */
    function __construct(TeamLocationsRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

}