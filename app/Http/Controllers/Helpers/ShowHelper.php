<?php namespace Sdcn\Http\Controllers\Helpers;

use Illuminate\Database\Eloquent\ModelNotFoundException;

trait ShowHelper
{
	public function show($api = true)
	{
		$args = func_get_args();

		$last = array_pop($args);

		try
		{
			$result = $this->repo->find($last->id);

			if($api)
			{
				return $this->data($result->toArray())->respond();
			}
			else
			{
				return $result;
			}
		}
		catch (ModelNotFoundException $e)
		{
			if($api)
			{
				return $this->statusNotFound()->respond();
			}
			else
			{
				return false;
			}
		}
	}
}
