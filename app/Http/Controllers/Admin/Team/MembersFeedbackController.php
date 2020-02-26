<?php namespace Sdcn\Http\Controllers\Admin\Team;

use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Team;
use Sdcn\Repositories\TeamFeedbackRepository;

class MembersFeedbackController extends AbstractController {

    use ListHelper;

    /**
     * @var TeamFeedbackRepository
     */
    protected $repo;

    public function __construct(TeamFeedbackRepository $repo)
    {
        $this->repo = $repo;
        $this->with = ['sender'];
    }
}