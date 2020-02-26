<?php namespace Sdcn\Repositories;

use Sdcn\Models\User;
use Sdcn\Models\Event;
use Sdcn\Repositories\Contracts\EventRepositoryInterface;

class EventRepository extends AbstractChildRepository implements EventRepositoryInterface
{
    protected $sorters = [
        "created_at" => []
    ];

	protected $filters = [
		'user_id' => ['user_id = ?', ":value"]
	];

	public function __construct(Event $model, User $parent)
	{
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'events';
	}
}