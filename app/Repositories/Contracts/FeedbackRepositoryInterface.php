<?php namespace Sdcn\Repositories\Contracts;


use Sdcn\Models\Job;
use Sdcn\Models\User;

interface FeedbackRepositoryInterface extends AbstractRepositoryInterface
{

	public function publish(Job $job, User $by, array $attributes);
}