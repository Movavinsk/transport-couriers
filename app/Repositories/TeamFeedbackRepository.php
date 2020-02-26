<?php namespace Sdcn\Repositories;

use Illuminate\Support\Facades\Event;
use Sdcn\Models\Feedback;
use Sdcn\Models\Team;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\TeamFeedbackRepositoryInterface;

class TeamFeedbackRepository extends AbstractChildRepository implements TeamFeedbackRepositoryInterface {


    public function __construct(Feedback $model, Team $parent)
    {
        $this->model = $model;
        $this->parent = $parent;
        $this->childRelation = 'feedback';
    }

}