<?php namespace Sdcn\Http\Controllers\Admin\Team;

use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Team;
use Sdcn\Repositories\TeamDocumentsRepository;

class MembersDocumentsController extends AbstractController {

    use ListHelper,
        ShowHelper,
        DestroyHelper,
        StoreHelper,
        UpdateHelper;

    /**
     * @var TeamRepository
     */
    protected $repo;

    public function __construct(TeamDocumentsRepository $repo)
    {
        $this->repo = $repo;
        $this->with = ['user'];
    }
}