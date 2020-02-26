<?php namespace Sdcn\Http\Requests\Location;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'location' => 'required',
			'latitude' => 'required|numeric',
			'longitude' => 'required|numeric',
			'miles' => 'required|integer'
		];
	}

	public function authorize()
	{
		return true;
	}
}
