<?php namespace Sdcn\Http\Controllers\User\Team;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Repositories\Contracts\TeamRepositoryInterface;

class TeamController extends AbstractController {

    use ShowHelper, UpdateHelper;

    /**
     * @var TeamRepositoryInterface
     */
    protected $repo;

    public function __construct(TeamRepositoryInterface $repo)
    {
        $this->repo = $repo;
        $repo->with(['members', 'primaryMember']);
    }


}