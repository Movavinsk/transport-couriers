<?php namespace Sdcn\Http\Controllers\Admin\Team;

use Sdcn\Http\Requests\AbstractFormRequest;

class MemberController extends \Sdcn\Http\Controllers\User\Team\MemberController {

    public function update(AbstractFormRequest $request, $api = true)
    {
        // On all (plain/nested) routes, We need the last id on nested chain to perform update.
        // mysql ids are sufficient to reach any level of child, so we just grab the last argument.
        //eg: companies/5/contacts/63, here contact 63 will always reach same child regardless of parent company 5.*
        $args = func_get_args();

        $last = array_pop($args);

        $updatedData = $this->getResourceUpdateValues($request);

        $this->repo->update($last, $updatedData);
        if($api)
        {
            return $this
                ->messages('update', 'Updated successfully!')
                ->statusUpdated()
                ->respond();
        }
        else
        {
            return true;
        }
    }

    public function getResourceUpdateValues($request)
    {
        return $request->all();
    }

}