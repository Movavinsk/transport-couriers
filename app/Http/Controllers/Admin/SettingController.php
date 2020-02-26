<?php namespace Sdcn\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Sdcn\Models\Setting;

/**
 * Class SettingController
 * @package Sdcn\Http\Controllers
 */
class SettingController extends BaseController
{
	use ApiResponseHelper;

	public function show($namespace)
	{
		return $this->data(Setting::whereRaw("`key` like '" . $namespace . "%'")->pluck('value', 'key'))->respond();
	}

	public function store(Request $request)
	{
		$request = $request->all();

		foreach($request as $key => $value)
		{
			if( strlen($key) )
			{
				try
				{
					$setting = Setting::find($key);

					$setting->value = $value;

					$setting->save();
				}
				catch(\Exception $e)
				{

				}
			}
		}
		return $this
			->messages('store', 'Stored successfully!')
			->statusUpdated()
			->respond();
	}
}
