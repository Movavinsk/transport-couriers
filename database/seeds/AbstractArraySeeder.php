<?php

use Illuminate\Database\Seeder;

/**
 * Class AbstractArraySeeder
 * Uses $items array to sync (create/update) seed data based on primary key
 * If primary key is not provided it will try to create
 */
class AbstractArraySeeder extends Seeder
{
	protected $items = [];

	protected $model = null;

	public function run()
	{
		if (is_null($this->model))
		{
			throw new \RuntimeException(get_class($this) . ' $model not provided');
		}

		$keyName = $this->model->getKeyName();

		foreach ($this->items as $item)
		{
			if( array_key_exists($keyName, $item) )
			{
				$row = $this->model->find($item[$keyName]);

				if( is_null($row) )
				{
					$this->model->create($item); // if row does not exists, create it
				}
				else
				{
					$row->update($item); // If row exists, update it
				}
			}
			else //Always create row if key is not provided
			{
				$this->model->create($item);
			}
		}
	}
}
