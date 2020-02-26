<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

trait ListOwnedHelper {

	public function index(Request $request, $api = true)
	{
		$repository = $this->prepareRepositoryPagination($request);

		$filters = [$this->getOwningControlColumn() => Auth::user()->getAuthIdentifier()] + $request->get('filter', []);
		$repository->filterBy($filters)
			->sortBy($request->input('sorting', []), true);

		$result = $repository->get();

		return $this->data($result->toArray()['data'])->paginator($result)->respond();
	}

	public function getOwningControlColumn()
	{
		return 'user_id';
	}
}