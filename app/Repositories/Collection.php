<?php namespace Sdcn\Repositories;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class Collection extends EloquentCollection {

	public function __call($method, $parameters)
	{
		if( substr($method, 0, 2) == 'to' )
		{
			return call_user_func_array(array($this, 'toCustomArray'), [ $method ]);
		}
		return parent::__call($method, $parameters);
	}

	public function toCustomArray($method)
	{
		return array_map(function($value) use ($method)
		{
			return $value instanceof Arrayable ? call_user_func([$value, $method]) : $value;

		}, $this->items);
	}

}