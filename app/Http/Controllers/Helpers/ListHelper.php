<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Http\Request;
use Sdcn\Repositories\AbstractChildRepository;

trait ListHelper
{

    /**
     * @see RepositoryPagination
     * @return array
     */
    abstract function getWithRelated();

    public function index(Request $request, $api = true)
    {
        $perPage = config('sdcn.results-per-page', 10);
        $perPage = (is_null($perPage)?10:$perPage);

        $count = $request->input('count', $perPage);
        $page = $request->input('page', 1);

        $args = func_get_args();

        // Assuming, child repositories have parent, model and childRelation pre-defined through repo constructor. See RealtorCreditRepository
        // If repo is a child repo we pass last argument as parentId to fully establish relationship
        if($this->repo instanceof AbstractChildRepository)
        {
            $parent_id = array_pop($args)->id ?: null;
            if ($parent_id instanceof Request === false) {
                $this->repo->parentId($parent_id);
            }
        }

        $repo = $this->repo->paginate($count, $page);
        $repo->with($this->getWithRelated());

        $filters = $request->input('filter', []);
        if( count($filters) > 0 ) $repo->filterBy($filters);

        $sorters = $request->input('sorting', []);
        if( count($sorters) > 0 ) $repo->sortBy($sorters);

        $result = $repo->get();

        if($api)
        {
            return $this->data($result->toArray()['data'])->paginator($result)->respond();
        }
        else
        {
            return $result;
        }
    }
}
