<?php namespace Sdcn\Http\Controllers;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\AbstractChildRepository;
use Sdcn\Repositories\Contracts\VehicleRepositoryInterface;

/**
 * Class VehicleController
 * @package Sdcn\Http\Controllers
 */
class VehicleController extends AbstractController {

	use Helpers\ResourceHelper;

	/**
	 * @var VehicleRepositoryInterface
	 */
	public $repo;

	/**
	 * @param VehicleRepositoryInterface $repo
	 */
	function __construct(VehicleRepositoryInterface $repo)
	{
		$this->repo = $repo;
	}

	public function show($api = true)
	{
		$args = func_get_args();

		$last = array_pop($args);

		try {
			$result = $this->repo->find($last);

			if ($api) {
				return $this->data($result->toArray())->respond();
			} else {
				return $result;
			}
		} catch (ModelNotFoundException $e) {
			if ($api) {
				return $this->statusNotFound()->respond();
			} else {
				return false;
			}
		}
	}

	public function update(AbstractFormRequest $request, $api = true)
	{
		// On all (plain/nested) routes, We need the last id on nested chain to perform update.
		// mysql ids are sufficient to reach any level of child, so we just grab the last argument.
		//eg: companies/5/contacts/63, here contact 63 will always reach same child regardless of parent company 5.*
		$args = func_get_args();

		$last = array_pop($args);

		$updatedData = $this->getResourceUpdateValues($request);

		$this->repo->update($last, $updatedData);
		if ($api) {
			return $this
				->messages('update', 'Updated successfully!')
				->statusUpdated()
				->respond();
		} else {
			return true;
		}
	}

	public function store(AbstractFormRequest $request, $api = true)
	{
		//@todo [LOW] On nested routes, we do not grab parent id from url (Laravel route matcher passes them into this function)
		// Due to which the post requests from angular must contain all parent ids on nested chain.
		// This is not an issue on `index`, `update` & `destroy` but `store` only. Model attributes are exposed to ft end this issue is not huge.
		// [Not recommended] Implementing store method on each controller is one solution but reduces development time.

		$args = func_get_args();

		// Assuming, child repositories have parent, model and childRelation pre-defined through repo constructor. See RealtorCreditRepository
		// If repo is a child repo we pass last argument as parentId to fully establish relationship
		if ($this->repo instanceof AbstractChildRepository) {
			$parent_id = array_pop($args) ?: null;

			if ($parent_id instanceof Request === false) {
				$this->repo->parentId($parent_id);
				$this->repo->make();
			}
		}
		$result = $this->repo->create($this->getResourceStoreValues($request));

		if ($api) {
			return $this->data([$result])->statusCreated()->respond();
		} else {
			return $result;
		}
	}

	public function destroy($api = true)
	{
		$args = func_get_args();

		$last = array_pop($args);

		$result = $this->repo->delete($last);

		if ($api) {
			if (!$result) {
				return $this->statusBadRequest()->respond();
			} else {
				return $this->statusDeleted()->respond();
			}
		} else {
			return $result;
		}
	}

}
