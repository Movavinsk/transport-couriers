<?php namespace Sdcn\Http\Controllers\User\Team\Job;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Repositories\Contracts\JobRepositoryInterface;

class JobController extends AbstractController
{
    use ShowHelper, StoreHelper, UpdateHelper;

    /**
     * @var JobRepositoryInterface
     */
    protected $repo;

    /**
     * @var Guard
     */
    protected $auth;

    /**
     * @param Guard $auth
     * @param JobRepositoryInterface $repo
     */
    public function __construct(Guard $auth, JobRepositoryInterface $repo)
    {
        $this->auth = $auth;
        $this->repo = $repo;
    }

    public function index(Request $request, $api = true)
    {
        $repo = $this->prepareRepositoryPagination($request);

        $repo->filterBy($request->get('filter', []));
        $repo->postedByTeamMembers($request->team);

        $sorters = $request->input('sorting', []);
        if( count($sorters) > 0 ) $repo->sortBy($sorters);

        $result = $repo->get();
        $statistics = $repo->getStatistics();

        return $this->data($result->toArray()['data'])->property('statuses', $statistics)->paginator($result)->respond();
    }
}
