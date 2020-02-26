<?php namespace Sdcn\Http\Controllers\User;


use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\DocumentTypeRepositoryInterface;

class DocumentTypeController extends AbstractController {

    use ListHelper;

    /**
     * @var DocumentTypeRepositoryInterface
     */
    protected $repo;

    public function __construct(DocumentTypeRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function index(Request $request, $api = true)
    {
        $count = $request->input('count', 0);
        $page = $request->input('page', 0);

        $args = func_get_args();

        if ($count && $page) {
            $this->repo->paginate($count, $page);

        }

        $filters = $request->input('filter', []);
        if( count($filters) > 0 ) $this->repo->filterBy($filters);

        $sorters = $request->input('sorting', []);
        if( count($sorters) > 0 ) $this->repo->sortBy($sorters);

        $result = $this->repo->get();


        if($api && $count && $page)
        {
            return $this->data($result->toArray()['data'])->paginator($result)->respond();
        }
        else
        {
            return $this->data($result->toArray())->respond();
        }
    }
}