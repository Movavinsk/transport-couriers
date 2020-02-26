<?php

namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Auth;
use Sdcn\Models\User;
use Sdcn\Models\Vehicle;
use Sdcn\Repositories\Contracts\UserVehiclesRepositoryInterface;

/**
 * Class UserVehiclesRepository
 * @package Sdcn\Repositories
 */
class UserVehiclesRepository extends AbstractChildRepository implements UserVehiclesRepositoryInterface
{
    protected $sorters = [
        'size' => []
    ];

    protected $filters = [
        'search' => ['name LIKE ?', '%:value%']
    ];

    public function __construct(Vehicle $model, User $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        // method on the model that defines the relation
        $this->childRelation = 'vehicles';
    }

    public function create($attributes)
    {
        if (request()->users) {
            $user = User::findOrFail(request()->users);
        } elseif (! is_null($this->parentId)) {
            $user = User::findOrFail($this->parentId);
        } else {
            $user = Auth::user();
        }

        $vehicles = Vehicle::whereIn('id', collect($attributes)->pluck('id'))->get();

        $user->vehicles()->sync($vehicles);

        return $vehicles->toArray();

    }

}
