<?php

namespace Sdcn\Http\Controllers\Directory;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Repositories\Contracts\TeamFeedbackRepositoryInterface;
use Illuminate\Http\Request;

class FeedbackController extends AbstractController {

    use ListHelper;

    /**
     * @var TeamFeedbackRepositoryInterface
     */
    public $repo;

    protected $with = ['sender', 'owner'];

    /**
     * @param TeamFeedbackRepositoryInterface $repo
     */
    function __construct(TeamFeedbackRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function getOwningControlColumn()
    {
        return 'owner_id';
    }

    // public function index(Request $request, $api = true)
    // {
    //     dd($request->team);
    // }
}