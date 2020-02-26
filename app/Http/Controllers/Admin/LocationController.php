<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\LocationRepositoryInterface;
use Sdcn\Http\Controllers\AbstractController;

/**
 * Class LocationController
 * @package Sdcn\Http\Controllers
 */
class LocationController extends AbstractController
{
	use ResourceHelper;

	/**
	 * @var LocationRepositoryInterface
	 */
	public $repo;

	/**
	 * @param LocationRepositoryInterface $repo
	 */
	function __construct(LocationRepositoryInterface $repo)
	{
		$this->repo = $repo;
	}

}
