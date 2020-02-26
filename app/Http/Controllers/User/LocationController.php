<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\Contracts\LocationRepositoryInterface;

/**
 * Class LocationController
 * @package Sdcn\Http\Controllers
 */
class LocationController extends AbstractController
{
    use ListHelper;
    use ShowHelper;
    use StoreHelper;
    use UpdateHelper;
    use DestroyHelper;

    /**
     * @var LocationRepositoryInterface
     */
    public $repo;

    /**
     * @param LocationRepositoryInterface $repo
     */
    function __construct(LocationRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

}

