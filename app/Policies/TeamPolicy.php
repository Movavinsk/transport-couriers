<?php

namespace Sdcn\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use Sdcn\Models\Team;
use Sdcn\Models\User;

class TeamPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    public function blockTeam(User $user, Team $team)
    {
        return $user->team->id != $team->id && !$user->team->blockedTeams->contains($team->id);
    }

    public function unblockTeam(User $user, Team $team)
    {
        return $user->team->blockedTeams->contains($team->id);
    }
}
