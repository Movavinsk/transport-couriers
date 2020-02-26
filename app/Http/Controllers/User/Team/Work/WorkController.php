<?php namespace Sdcn\Http\Controllers\User\Team\Work;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Repositories\Contracts\JobRepositoryInterface;

class WorkController extends AbstractController {

    /**
     * @var JobRepositoryInterface
     */
    protected $repo;
    /**
     * @var Guard
     */
    private $guard;


    public function __construct(JobRepositoryInterface $repo, Guard $guard)
    {
        $this->repo = $repo;
        $this->guard = $guard;
    }

    public function index(Request $request, $api = true)
    {
        $repository = $this->prepareRepositoryPagination($request);

        if($request['filter']['work_source']) {
            $repository->setTeamWorkSource($request['filter']['work_source']);
        }

        $repository->sortBy($request->input('sorting', []), true);
        $repository->callableFilters[] = function(JobRepositoryInterface $repository) use($request) {
            $team = $this->guard->user()->team;
            $repository->filterWhereTeamBidded($team);
            $repository->eagerLoadTeamBid($team);
        };

        $result = $repository->get();

        return $this->data($result->toArray()['data'])->paginator($result)->respond();
    }

}