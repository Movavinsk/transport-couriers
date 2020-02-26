<?php namespace Sdcn\Http\Controllers\Helpers;

use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\AbstractChildRepository;

trait StoreHelper
{

    public function store(AbstractFormRequest $request, $api = true)
    {
        //@todo [LOW] On nested routes, we do not grab parent id from url (Laravel route matcher passes them into this function)
        // Due to which the post requests from angular must contain all parent ids on nested chain.
        // This is not an issue on `index`, `update` & `destroy` but `store` only. Model attributes are exposed to ft end this issue is not huge.
        // [Not recommended] Implementing store method on each controller is one solution but reduces development time.

        $args = func_get_args();

        // Assuming, child repositories have parent, model and childRelation pre-defined through repo constructor. See RealtorCreditRepository
        // If repo is a child repo we pass last argument as parentId to fully establish relationship
        if($this->repo instanceof AbstractChildRepository)
        {
            $parent_id = array_pop($args)->id ?: null;

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

    /**
     * @param AbstractFormRequest $request
     *
     * @return array
     */
    protected function getResourceStoreValues(AbstractFormRequest $request)
    {
        return $request->all();
    }
}
