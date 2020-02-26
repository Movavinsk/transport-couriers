<?php namespace Sdcn\Http\Requests\Vehicle;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'name' => 'required',
			'sort_no' => [
				'numeric',
				'nullable',
			],
			'file' => [
				'mimes:svg',
				'required',
			]
		];
	}

	public function authorize()
	{
		return true;
	}

}
