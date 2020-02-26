<?php namespace Sdcn\Http\Controllers\User;

use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\Contracts\DocumentRepositoryInterface;

/**
 * Class DocumentController
 * @package Sdcn\Http\Controllers
 */
class DocumentController extends AbstractController
{
    use ListHelper;
    use ShowHelper;
    use StoreHelper;
    use DestroyHelper;

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
