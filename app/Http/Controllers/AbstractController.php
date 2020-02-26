<?php namespace Sdcn\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Sdcn\Http\Controllers\Helpers\RepositoryPaginationHelper;
use Sdcn\Http\Requests\AbstractFormRequest;

/**
 * Class AbstractController
 * @package Sdcn\Http\Controllers
 */
abstract class AbstractController extends BaseController
{
	use DispatchesJobs,
		ValidatesRequests,
		ApiResponseHelper,
		RepositoryPaginationHelper;

	// @todo We need to override throwValidationException from trait ValidatesRequests and wrap it inside messages
	// protected function throwValidationException(Request $request, $validator)

	/**
	 * @throws \BadMethodCallException
	 */
	public function index(Request $request, $api = true)
	{
		throw new \BadMethodCallException('index');
	}

	/**
	 * `create` method is used to send ui form (Not needed in APIs)
	 * @throws \BadMethodCallException
	 */
	public function create()
	{
		throw new \BadMethodCallException('create');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function store(AbstractFormRequest $request, $api = true)
	{
		throw new \BadMethodCallException('store');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function show($api = true)
	{
		throw new \BadMethodCallException('show');
	}

	/**
	 * `edit` method is used to send ui form (Not needed in APIs)
	 * @throws \BadMethodCallException
	 */
	public function edit()
	{
		throw new \BadMethodCallException('edit');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function update(AbstractFormRequest $request, $api = true)
	{
		throw new \BadMethodCallException('update');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function destroy($api = true)
	{
		throw new \BadMethodCallException('destroy');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function select(Request $request, $api = true)
	{
		throw new \BadMethodCallException('select');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function upload()
	{
		throw new \BadMethodCallException('upload');
	}

	/**
	 * @throws \BadMethodCallException
	 */
	public function delete()
	{
		throw new \BadMethodCallException('delete');
	}
}
