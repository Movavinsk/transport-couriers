<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Http\Request;
use Sdcn\Repositories\AbstractChildRepository;

trait SelectHelper
{
	public function select(Request $request, $api = true)
	{
		$args = func_get_args();

		$last = array_pop($args);

		if($this->repo instanceof AbstractChildRepository)
		{
			$this->repo->parentId($last ?: null);
		}

		$repo = $this->repo;

		$filters = $request->input('filter', []);
		if( count($filters) > 0 ) $repo->filterBy($filters);

		$sorters = $request->input('sorting', []);
		if( count($sorters) > 0 ) $repo->sortBy($sorters);

		$result = $repo->get();

		$keyName = $this->repo->selectKeyName;
		$valueName = $this->repo->selectValueName;

		$data = [];
		foreach($result as $item) {
			$data[] = [$keyName => $item->$keyName, $valueName => $item->$valueName];
		}
		if($api)
		{
			return $this->data($data)->respond();
		}
		else
		{
			return $data;
		}
	}
}
