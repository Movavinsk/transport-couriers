<?php namespace Sdcn\Http\Controllers\User\Team;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Requests\Team\Member\UpdateRequest;
use Sdcn\Models\Team;
use Sdcn\Repositories\Contracts\TeamMemberRepositoryInterface;
use Sdcn\Repositories\Contracts\TeamRepositoryInterface;
use Sdcn\Repositories\Contracts\UserRepositoryInterface;

class MemberController extends AbstractController {

    use UpdateHelper, StoreHelper, ShowHelper, ListHelper;

    /**
     * @var TeamRepositoryInterface
     */
    protected $teamRepository;

    /**
     * @var UserRepositoryInterface
     */
    protected $repo;

    public function __construct(TeamMemberRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function markAsPrimary()
    {
        $arguments = func_get_args();
        $this->repo->markAsTeamPrimary(array_pop($arguments)->id);
    }

    public function blockMember(Request $request)
    {
        $team = Team::find($request->blocked_team_id);

        if (Gate::denies('block-team', $team)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to block this member',
            ], 422);
        }

        Auth::user()->team->blockedTeams()->attach($request->blocked_team_id);

        return response()->json(['status' => 'success'], 200);
    }

    public function unblockMember(Request $request)
    {
        $team = Team::find($request->blocked_team_id);

        if (Gate::denies('unblock-team', $team)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have permission to unblock this member',
            ], 422);
        }

        Auth::user()->team->blockedTeams()->detach($request->blocked_team_id);

        return response()->json(['status' => 'success'], 200);
    }
}