<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Repositories\Contracts\EventRepositoryInterface;

class EventController extends AbstractController
{

	use UpdateHelper, ListOwnedHelper;

	/**
	 * @var Guard
	 */
	protected $auth;

	/**
	 * @var EventRepositoryInterface
	 */
	protected $repo;

	public function __construct(Guard $guard, EventRepositoryInterface $repo)
	{
		$this->auth = $guard;
		$this->repo = $repo;
	}


}