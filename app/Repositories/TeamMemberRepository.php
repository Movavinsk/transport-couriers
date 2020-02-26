<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Event;
use Sdcn\Models\Role;
use Sdcn\Models\Team;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\TeamMemberRepositoryInterface;

class TeamMemberRepository extends AbstractChildRepository implements TeamMemberRepositoryInterface {


    public function __construct(User $model, Team $parent)
    {
        $this->model  = $model;
        $this->parent = $parent;
        $this->childRelation = 'members';
    }


    public function markAsTeamPrimary($id)
    {
        $user = $this->find($id);
        $user->attachRole(Role::findByName('team.member.primary'));
        $user->touch();
        $user->cleanTrashablePrimaryMembers();
        Event::fire("user.role.primary", $user);
    }
}