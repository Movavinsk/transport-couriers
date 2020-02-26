<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\JobRepositoryInterface;

/**
 * Class JobController
 * @package Sdcn\Http\Controllers
 */
class JobController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var JobRepositoryInterface
     */
    public $repo;

    /**
     * @var array
     */
    protected $with = ['team'];

    /**
     * @param JobRepositoryInterface $repo
     */
    public function __construct(JobRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }
}