<?php namespace Sdcn\Repositories;

use Sdcn\Models\User;
use Sdcn\Models\Location;
use Sdcn\Repositories\Contracts\LocationRepositoryInterface;

/**
 * Class LocationRepository
 * @package Sdcn\Repositories
 */
class LocationRepository extends AbstractChildRepository implements LocationRepositoryInterface
{
    protected $sorters = [
        'created_at' => []
    ];

    protected $filters = [
        'search' => ['location LIKE ?', '%:value%'],
    ];

    public function __construct(Location $model, User $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'locations';
    }

}
