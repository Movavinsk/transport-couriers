<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\PodRepositoryInterface;

/**
 * Class PodController
 * @package Sdcn\Http\Controllers
 */
class PodController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var PodRepositoryInterface
     */
    public $repo;

    /**
     * @param PodRepositoryInterface $repo
     */
    public function __construct(PodRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }
}