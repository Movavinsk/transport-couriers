<?php

use Sdcn\Models\Vehicle;

class VehiclesSeeder extends AbstractArraySeeder
{
	protected $items = [
		[   'id' => 1,
			'name' => 'Motor cycle',
			'sort_no' => 1
		],
		[   'id' => 2,
			'name' => 'Cargo',
			'sort_no' => 2
		],
		[   'id' => 3,
			'name' => 'Van',
			'sort_no' => 3
		],
		[   'id' => 4,
			'name' => 'Truck',
			'sort_no' => 4
		],
	];

	public function __construct(Vehicle $model)
	{
		$this->model = $model;
	}
}
