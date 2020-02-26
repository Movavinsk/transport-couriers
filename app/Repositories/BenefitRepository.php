<?php

namespace Sdcn\Repositories;

use Sdcn\Models\Benefit;
use Sdcn\Models\Partner;
use Sdcn\Repositories\Contracts\BenefitRepositoryInterface;

class BenefitRepository extends AbstractChildRepository implements BenefitRepositoryInterface {

    protected $sorters = [
        'id' => [],
    ];

    protected $filters = [
        'active' => ['active = 1', 1]
    ];

    protected $perPage = -1;

    public function __construct(Benefit $model, Partner $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'benefits';
    }

    public function applyFilters()
    {
        parent::applyFilters();

        $this->perPage = -1;

        $this->query->where('active', 1);

        $this->query->orderBy('created_at');
    }

}