<?php namespace Sdcn\Http\Controllers\Helpers;

use Sdcn\Http\Requests\AbstractFormRequest;

//use Illuminate\Support\Facades\Input;
//use Watson\Validating\ValidationException;
//use Illuminate\Http\Response as IlluminateResponse;

trait UpdateHelper {

	public function update(AbstractFormRequest $request, $api = true)
	{
		// On all (plain/nested) routes, We need the last id on nested chain to perform update.
		// mysql ids are sufficient to reach any level of child, so we just grab the last argument.
		//eg: companies/5/contacts/63, here contact 63 will always reach same child regardless of parent company 5.*
		$args = func_get_args();

		$last = array_pop($args)->id;

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