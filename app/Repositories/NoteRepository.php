<?php namespace Sdcn\Repositories;

use Sdcn\Models\Note;
use Sdcn\Models\Team;
use Sdcn\Repositories\Contracts\NoteRepositoryInterface;

class NoteRepository extends AbstractChildRepository implements NoteRepositoryInterface
{
    public function __construct(Note $model, Team $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'notes';
    }

}