<?php namespace Sdcn\Handlers\Events;

use Illuminate\Support\Facades\Event;
use Sdcn\Models\Role;
use Sdcn\Models\User;

class SaveUserRoles {

    public function handle(User $user)
    {
        $roleIdsOnSave = $user->temp_roles_ids;
        $driver_role_id = Role::findByName('driver')->toArray();

        if(!empty($roleIdsOnSave)){
            if($user->team->canBid()){
                $this->initialDriverSync($user, $roleIdsOnSave, $driver_role_id);
            }else{
                $rolesWithoutDriver = array_diff($roleIdsOnSave, $driver_role_id);
                $user->roles()->sync($rolesWithoutDriver);
            }
        }
    }

    public function initialDriverSync(User $user, array $roleIdsOnSave, $driver_role_id): void
    {
        if (!in_array($driver_role_id, $user->roles()->pluck('role_user.id')->toArray()) && in_array($driver_role_id, $roleIdsOnSave)) {
            Event::fire('user.role.driver', $user);
        }
        $user->roles()->sync($roleIdsOnSave);
    }
}