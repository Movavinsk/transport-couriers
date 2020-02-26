<?php

namespace Sdcn\Http\Controllers\Directory;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Repositories\Contracts\TeamDocumentsRepositoryInterface;
use Illuminate\Http\Request;

class DocumentsController extends AbstractController {

    use ListHelper;

    /**
     * @var TeamDocumentsRepositoryInterface
     */
    public $repo;

    /**
     * @param TeamDocumentsRepositoryInterface $repo
     */
    function __construct(TeamDocumentsRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

}