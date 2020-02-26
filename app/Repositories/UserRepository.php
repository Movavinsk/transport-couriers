<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Event;
use Sdcn\Models\Role;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\UserRepositoryInterface;

/**
 * Class UserRepository
 * @package Sdcn\Repositories
 */
class UserRepository extends AbstractRepository implements UserRepositoryInterface
{
	protected $sorters = [
		'name' => [
			'asc' => ['name_first', 'asc'],
			'desc' => ['name_first', 'desc'],
		],
		'name_first' => [],
		'name_last' => [],
		'email' => [],
        'id' => [
            'asc' => ['id', 'asc']
        ],
        'created_at' => [],
    ];

	protected $filters = [
		'id' => ['id = ?', ':value'],
		'name' => ['(name_first LIKE ? OR name_last LIKE ?)', '%:value%', '%:value%'],
		'search' => ['(id = ? OR name_first LIKE ? OR name_last LIKE ? OR email LIKE ? OR id LIKE ? AND inactivated = 0)',  ':value', '%:value%', '%:value%', '%:value%', '%:value%'],
        'inactivated' => ['inactivated = ?', ':value']
	];

	public function __construct(User $model)
	{
		$this->model = $model;
	}

    public function hideCurrentUser()
    {
        $this->query->where('id', '!=', \Auth::user()->id);
    }

    public function limitByPublicDetails()
    {
        $this->query->select('id', 'name_first', 'name_last', 'email', 'team_id');
    }

    public function applyFilters()
    {
        parent::applyFilters();

        if(array_key_exists('pending_documents_approval', $this->filterBy) && $this->filterBy['pending_documents_approval'] === "true")
        {
            $this->query = $this->query->whereRaw(' (SELECT COUNT(*) FROM documents WHERE documents.user_id=users.id AND documents.status = "pending") > 0');
        }

        if(array_key_exists('no_docs', $this->filterBy) && $this->filterBy['no_docs'] === "true")
        {
            $this->query = $this->query->whereRaw(' (SELECT COUNT(*) FROM documents WHERE documents.user_id=users.id) = 0');
        }
    }

    public function saveUserRoles(User $user, $roles)
    {
        if($user->id != auth()->user()->id){
            $driver_role_id = Role::findByName('driver')->toArray();

            if($user->team->canBid()){
                $this->initialDriverSync($user, $roles, $driver_role_id);
            }else{
                $rolesWithoutDriver = array_diff($roles, $driver_role_id);
                $user->roles()->sync($rolesWithoutDriver);
            }
        }
    }

    public function initialDriverSync(User $user, array $roles, $driver_role_id): void
    {
        if (!in_array($driver_role_id, $user->roles()->pluck('role_user.id')->toArray()) && in_array($driver_role_id, $roles)) {
            Event::fire('user.role.driver', $user);
        }
        $user->roles()->sync($roles);
    }

}
