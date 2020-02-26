<?php namespace Sdcn\Repositories;

use Sdcn\Models\Statistic;
use Sdcn\Repositories\Contracts\StatisticRepositoryInterface;

class StatisticRepository extends AbstractRepository implements StatisticRepositoryInterface
{
    protected $sorters = [
        "id" => []
    ];

    protected $filters = [
        'type' => ['type = ?', ':value'],
        'created_at_date_start' => ['DATE(created_at) >= ?', ':value'],
        'created_at_date_end' => ['DATE(created_at) <= ?', ':value'],
    ];

	public function __construct(Statistic $model)
	{
		$this->model = $model;
	}
}