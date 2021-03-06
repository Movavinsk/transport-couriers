<?php

namespace Sdcn\Http\Controllers\Admin;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Benefit;
use Sdcn\Models\Partner;
use Sdcn\Repositories\Contracts\BenefitRepositoryInterface;

class BenefitsController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var JobRepositoryInterface
     */
    public $repo;

    /**
     * @var array
     */
    protected $with = ['partner'];

    /**
     * @param BenefitRepositoryInterface $repo
     */
    public function __construct(BenefitRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function store(AbstractFormRequest $request, $api = true)
    {
        $benefit = new Benefit($this->getResourceStoreValues($request));

        $benefit->partner_id = $request->partner;

        $benefit->save();
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

    public function getResourceUpdateValues($request)
    {
        return $request->all();
    }
}
