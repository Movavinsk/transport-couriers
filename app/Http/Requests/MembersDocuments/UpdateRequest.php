<?php namespace Sdcn\Http\Requests\MembersDocuments;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Repositories\TeamDocumentsRepository;

class UpdateRequest extends CreateRequest {

    /**
     * @var Guard
     */
    protected $guard;

    /**
     * @var TeamRepositoryInterface
     */
    protected $repo;

    public function __construct(Guard $guard, TeamDocumentsRepository $repo)
    {
        $this->guard = $guard;
        $this->repo = $repo;
    }

    public function authorize()
    {
        $args = $this->segments();
        $team = $this->repo->find(array_pop($args));
        return $this->guard->user()->hasRole("admin") || $team->hasMember($this->guard->user()->getAuthIdentifier());
    }
}
