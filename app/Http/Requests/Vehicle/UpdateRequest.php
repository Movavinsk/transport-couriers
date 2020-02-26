<?php namespace Sdcn\Http\Requests\Vehicle;

use Sdcn\Http\Requests\AbstractFormRequest;

class UpdateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'name' => 'required',
			'sort_no' => 'numeric',
			'file' => 'mimes:svg',
		];
	}

	public function authorize()
	{
		return true;
	}
}
