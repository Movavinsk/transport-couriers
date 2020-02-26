<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Event;
use Sdcn\Models\Location;
use Sdcn\Models\Team;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\TeamLocationsRepositoryInterface;

class TeamLocationsRepository extends AbstractChildRepository implements TeamLocationsRepositoryInterface {


    public function __construct(Location $model, Team $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'locations';
    }

}