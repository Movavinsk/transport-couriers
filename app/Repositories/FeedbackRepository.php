<?php namespace Sdcn\Repositories;

use Sdcn\Models\Feedback;
use Sdcn\Models\Job;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\FeedbackRepositoryInterface;

class FeedbackRepository extends AbstractChildRepository implements FeedbackRepositoryInterface
{

	protected $sorters = [
		"created_at" => []
	];

	protected $filters = [
		'owner_id' => ['owner_id = ?', ":value"],
		'comment' => ['comment = ?', ":value"]
	];


	public function __construct(Feedback $model, User $parent)
	{
		$this->model = $model;
		$this->parent = $parent;
		$this->childRelation = 'feedbacks';
	}

	public function publish(Job $job, User $by, array $attributes)
	{
		$leave_to = $job->getOtherParticipant($by->id);

		if (!$attributes['bid_id']) $attributes['bid_id'] = null;
		return $this->model->create($attributes+[
			'job_id' => $job->id,
			'owner_id' => $leave_to,
			'sender_id' => $by->id,
		]);
	}
}