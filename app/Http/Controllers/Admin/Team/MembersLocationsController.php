<?php namespace Sdcn\Http\Controllers\Admin\Team;

use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Team;
use Sdcn\Repositories\TeamLocationsRepository;

class MembersLocationsController extends AbstractController {

    use ListHelper, DestroyHelper;

    /**
     * @var TeamFeedbackRepository
     */
    protected $repo;

    public function __construct(TeamLocationsRepository $repo)
    {
        $this->repo = $repo;
        $this->with = ['user'];
    }

}
