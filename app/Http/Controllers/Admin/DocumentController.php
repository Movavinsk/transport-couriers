<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\DocumentRepositoryInterface;
use Sdcn\Http\Controllers\AbstractController;

/**
 * Class DocumentController
 * @package Sdcn\Http\Controllers
 */
class DocumentController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var DocumentRepositoryInterface
     */
    public $repo;

    /**
     * @param DocumentRepositoryInterface $repo
     */
    function __construct(DocumentRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

}
