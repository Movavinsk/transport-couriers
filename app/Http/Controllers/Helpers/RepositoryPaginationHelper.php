<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Http\Request;
use Sdcn\Repositories\Contracts\AbstractRepositoryInterface;

trait RepositoryPaginationHelper
{

	/**
	 * @param  Request $request
	 * @return AbstractRepositoryInterface
	 */
	protected function prepareRepositoryPagination(Request $request)
	{
		$perPage = config('sdcn.results-per-page', 10);
		$perPage = (is_null($perPage) ? 10 : $perPage);

		$count = $request->input('count', $perPage);
		$page = $request->input('page', 1);

		$repo = $this->repo->paginate($count, $page);
		$repo->with($this->getWithRelated());

		return $repo;
	}

	public function getWithRelated()
	{
		return property_exists($this, 'with') ? $this->with : [];
	}
}