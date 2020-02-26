<?php namespace Sdcn\Http\Requests\Event;

use Illuminate\Console\Scheduling\Event;
use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\EventRepository;

class UpdateRequest extends AbstractFormRequest {

	/**
	 * @var EventRepository
	 */
	private $repository;

	/**
	 * @var Guard
	 */
	private $auth;

	public function __construct(EventRepository $repository, Guard $auth)
	{
		$this->repository = $repository;
		$this->auth = $auth;
	}

	public function rules()
	{
		return [];
	}

	public function authorize()
	{
		return $this->repository->find($this->get('id'))->user_id == $this->auth->user()->id;
	}
}