<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Repositories\Contracts\InvoiceRepositoryInterface;

/**
 * Class InvoiceController
 * @package Sdcn\Http\Controllers
 */
class InvoiceController extends AbstractController
{
	use ListHelper, ShowHelper, StoreHelper;

	/**
	 * @var InvoiceRepositoryInterface
	 */
	protected $repo;

	/**
	 * @var Guard
	 */
	protected $auth;

	/**
	 * @param Guard $auth
	 * @param InvoiceRepositoryInterface $repo
	 */
	public function __construct(Guard $auth, InvoiceRepositoryInterface $repo)
	{
		$this->auth = $auth;

		$this->repo = $repo;
	}

	public function download($invoice_id)
	{
		$data = $this->repo->find($invoice_id)->toArray();

        return \SPDF::loadView('pdfs.invoice', $data)->download($data['invoice_number'] . '.pdf');
	}
}
