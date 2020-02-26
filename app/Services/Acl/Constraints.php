<?php namespace Sdcn\Services\Acl;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Models\Team;
use Sdcn\Models\User;
use Sdcn\Services\Acl\Annotations\Ace;

class Constraints
{

    /**
     * @var Request
     */
    protected $request;

    /**
     * @var User
     */
    protected $user;

    public function __construct(Request $request, Guard $guard)
    {
        $this->request = $request;
        $this->user = $guard->user();
    }

    /**
     * Please use snake case for the function methods as it's
     * more readable in these cases.
     */

    /**
     * @Ace(route="api.user.profile.show")
     * @Ace(route="api.user.profile.update")
     */
    public function modify_only_subordinates()
    {
        return in_array($this->request->profile, $this->user->subordinates());
    }

    /**
     * @Ace(route="api.user.bids.store")
     */
    public function has_add_bid_right()
    {
        return $this->user->can('add-bid');
    }

    /**
     * @Ace(route="api.user.team.members.store")
     */
    public function only_five_members_per_team()
    {
        return Team::find($this->request->team)->members()->count() < 10;
    }

    /**
     * @Ace(route="api.user.team.update")
     */
    public function only_the_primary_user()
    {
        return Team::find($this->request->team)->primaryMember->id == $this->user->id;
    }

    /**
     * @Ace(route="api.user.teams.jobs.index")
     */
    public function only_his_team()
    {
        return $this->request->teams == $this->user->team_id;
    }
}
