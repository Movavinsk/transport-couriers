<?php

namespace Sdcn\Http\Controllers\Directory;

use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Repositories\Contracts\TeamRepositoryInterface;

class DirectoryController extends AbstractController
{
    /**
     * @var TeamRepositoryInterface
     */
    public $repo;

    /**
     * @param TeamRepositoryInterface $repo
     */
    function __construct(TeamRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function directory(Request $request)
    {
        $perPage = config('sdcn.results-per-page', 10);
        $perPage = (is_null($perPage) ? 10 : $perPage);

        $repo = $this->repo;

        $repo->with($this->getWithRelated());

        $this->repo->filterBy(['members_directory' => true], true);

        $this->repo->filterBy(['deactivated_at' => 'NULL'], true);

        $filters = $request->input('filter', []);
        if (count($filters) > 0) {
            $repo->filterBy($filters);
        }

        $sorters = $request->input('sorting', []);
        if (count($sorters) > 0) {
            $repo->sortBy($sorters);
        }

        if (request()->input('filter.filter_by_blocked_teams') == 'true') {
           $this->repo->showOnlyBlockedTeams();
        }

        $result = $repo->paginate($request->input('count', $perPage), $request->input('page', 1))->get();

        return $this->data($result->toArray()['data'])->paginator($result)->respond();
    }

}
