<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Job;
use Sdcn\Repositories\Contracts\FeedbackRepositoryInterface;
use Sdcn\Repositories\EventRepository;

class FeedbackController extends AbstractController {

	use ListOwnedHelper {
		index as baseIndex;
	}


	/**
	 * @var Guard
	 */
	protected $guard;

	/**
	 * @var FeedbackRepositoryInterface
	 */
	protected $repo;

	public function __construct(Guard $guard, FeedbackRepositoryInterface $repo)
	{
		$this->guard = $guard;
		$this->repo = $repo;
	}

	public function index(Request $request, $api = true)
	{
		$this->repo->with(['job', 'sender']);
		return $this->baseIndex($request, $api);
	}

	public function store(AbstractFormRequest $request, $api = true)
	{
		$this->repo->publish($request->job, $this->guard->user(), $request->only('rating', 'comment', 'bid_id'));
	}

	public function getOwningControlColumn()
	{
		return 'owner_id';
	}
}
