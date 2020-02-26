<?php

namespace Sdcn\Repositories;

use Sdcn\Models\Team;
use Sdcn\Models\Vehicle;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\TeamVehiclesRepositoryInterface;

class TeamVehiclesRepository extends AbstractChildRepository implements TeamVehiclesRepositoryInterface {


    public function __construct(Vehicle $model, Team $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'vehicles';
    }

}