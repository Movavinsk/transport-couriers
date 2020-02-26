<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Job;
use Sdcn\Repositories\Contracts\JobRepositoryInterface;

/**
 * Class JobController
 * @package Sdcn\Http\Controllers
 */
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
     *
     * @param JobRepositoryInterface $repo
     */
    public function __construct(Guard $auth, JobRepositoryInterface $repo)
    {
        $this->auth = $auth;

        $this->repo = $repo;
    }

    // Override for filter
    public function index(Request $request, $api = true)
    {
        $repo = $this->prepareRepositoryPagination($request);

        $filters = array_get($request->all(), 'filter', []);
        $filters = array_merge($filters,
            ['user_id' => $this->auth->user()->id]
        );
        if (count($filters) > 0) {
            $repo->filterBy($filters);
        }

        $sorters = $request->input('sorting', []);
        if (count($sorters) > 0) {
            $repo->sortBy($sorters);
        }

        $result = $repo->get();
        $statistics = $repo->getStatistics();

        return $this->data($result->toArray()['data'])->property('statuses',
            $statistics)->paginator($result)->respond();
    }

    public function work(Request $request, $api = true)
    {
        $repo = $this->prepareRepositoryPagination($request);

        $filters = array_get($request->all(), 'filter', []);

        if (count($filters) > 0) {
            $repo->filterBy($filters);
        }

        $sorters = $request->input('sorting', []);
        if (count($sorters) > 0) {
            $repo->sortBy($sorters);
        }

        $repo->callableFilters[] = function (JobRepositoryInterface $repository) use ($request) {
            $user = $this->auth->user();
            $repository->whereBidNotAccepted($user);
            $repository->filterWhereUserBidded($user);
            $repository->eagerLoadUserBid($user);
        };

        $result = $repo->get();

        $statistics = $repo->getStatistics();

        return $this->data($result->toArray()['data'])->property('statuses',
            $statistics)->paginator($result)->respond();
    }


    public function options()
    {
        return [
            'data' => [
                ["label" => "Temperature Controlled Van", "selected" => false],
                ["label" => "ADR", "selected" => false],
                ["label" => "Tail Lift", "selected" => false],
                ["label" => "Moffet", "selected" => false],
            ]
        ];
    }

    public function store(AbstractFormRequest $request, $api = true)
    {
        $data = $request->all();
        $data['user_id'] = Auth::user()->id;
        $result = $this->repo->create($request->all());

        return $this->data([$result])->statusCreated()->respond();
    }

    public function browse(Request $request, $api = true)
    {

        /*
         * This neds fleshing out a bit more. Ref #SDCN-52 and #SDCN-85

        if (!Auth::user()->documentsValid()) {
            return response()->json(['error' => 'Please check your document expiry dates before browsing jobs.'],
                403);
        }
        */

        $repo = $this->prepareRepositoryPagination($request);

        $filters = array_get($request->all(), 'filter', []);
        $filters = array_merge($filters,
            ['browse_team_id' => $this->auth->user()->team_id, 'status' => 'active']
        );
        if (count($filters) > 0) {
            $repo->filterBy($filters);
        }

        $sorters = $request->input('sorting', []);
        if (count($sorters) > 0) {
            $repo->sortBy($sorters);
        }

        $result = $repo->get();

        return $this->data($result->toBrowse()['data'])->paginator($result)->respond();
    }

    public function showJob(Job $job)
    {
        return $this->data($job->toArray())->respond();
    }

}
