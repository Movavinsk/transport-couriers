<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Repositories\RoleRepository;

class RoleController extends AbstractController {

    use ListHelper;

    /**
     * @var RoleRepository
     */
    protected $repo;

    public function __construct(RoleRepository $repo)
    {
        $this->repo = $repo;
        $this->repo->with(['perms']);
    }
}