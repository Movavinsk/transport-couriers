<?php namespace Sdcn\Http\Controllers\Helpers;

trait DestroyHelper {

	public function destroy($api = true)
	{
		$args = func_get_args();

		$last = array_pop($args);

		$result = $this->repo->delete($last->id);

		if($api)
		{
			if(!$result)
			{
				return $this->statusBadRequest()->respond();
			}
			else
			{
				return $this->statusDeleted()->respond();
			}
		}
		else
		{
			return $result;
		}
	}
}
