<?php namespace Sdcn\Repositories;

use Illuminate\Pagination\LengthAwarePaginator as LAP;

class LengthAwarePaginator extends LAP
{
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
		return [
			'total'         => $this->total(),
			'per_page'      => $this->perPage(),
			'current_page'  => $this->currentPage(),
			'last_page'     => $this->lastPage(),
			'next_page_url' => $this->nextPageUrl(),
			'prev_page_url' => $this->previousPageUrl(),
			'from'          => $this->firstItem(),
			'to'            => $this->lastItem(),
			'data'          => call_user_func([$this->items, $method]),
		];
	}
}