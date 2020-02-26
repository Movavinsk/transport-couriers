<?php namespace Sdcn\Repositories;

use Sdcn\Models\Role;
use Sdcn\Repositories\Contracts\RoleRepositoryInterface;

class RoleRepository extends AbstractRepository implements RoleRepositoryInterface {

    public function __construct(Role $model)
    {
        $this->model = $model;
    }
}