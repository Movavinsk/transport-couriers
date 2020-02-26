<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\DocumentTypeRepositoryInterface;

class DocumentTypeController extends AbstractController {

    use ResourceHelper;

    /**
     * @var DocumentTypeRepositoryInterface
     */
    protected $repo;

    public function __construct(DocumentTypeRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }
}