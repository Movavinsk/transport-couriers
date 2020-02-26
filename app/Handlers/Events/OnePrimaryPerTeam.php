<?php namespace Sdcn\Handlers\Events;

use Sdcn\Models\User;

class OnePrimaryPerTeam {

    // This might be hacky. Unfortunately, Eloquent it's not mature enough to support
    // events on complex relations. At this moment we'll stay with this solution,
    // possibly going to be refactored in the next laravel version.
    public function handle(User $user){
        $user->cleanTrashablePrimaryMembers();
    }
}