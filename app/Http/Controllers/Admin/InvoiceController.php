<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Repositories\Contracts\InvoiceRepositoryInterface;

/**
 * Class InvoiceController
 * @package Sdcn\Http\Controllers
 */
class InvoiceController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var InvoiceRepositoryInterface
     */
    public $repo;

    /**
     * @param InvoiceRepositoryInterface $repo
     */
    public function __construct(InvoiceRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }
}