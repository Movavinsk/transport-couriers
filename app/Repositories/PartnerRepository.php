<?php

namespace Sdcn\Repositories;

use Sdcn\Models\Partner;
use Sdcn\Repositories\Contracts\PartnerRepositoryInterface;

class PartnerRepository extends AbstractRepository implements PartnerRepositoryInterface {

    protected $sorters = [
        'name' => [],
        'created_at' => ['desc']
    ];

    protected $filters = [
        'search' => ['name LIKE ? ', '%:value%']
    ];

    public function __construct(Partner $model)
    {
        $this->model = $model;
    }
}