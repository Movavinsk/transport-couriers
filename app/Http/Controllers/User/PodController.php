<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Repositories\Contracts\PodRepositoryInterface;

/**
 * Class PodController
 * @package Sdcn\Http\Controllers
 */
class PodController extends AbstractController
{
	use ListHelper, ShowHelper, StoreHelper;

	/**
	 * @var PodRepositoryInterface
	 */
	protected $repo;

	/**
	 * @var Guard
	 */
	protected $auth;

	/**
	 * @param Guard $auth
	 * @param PodRepositoryInterface $repo
	 */
	public function __construct(Guard $auth, PodRepositoryInterface $repo)
	{
		$this->auth = $auth;

		$this->repo = $repo;
	}

// @todo Override index, store, show methods user_id spoofing

}
