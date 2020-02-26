<?php namespace Sdcn\Http\Requests\User;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'name_first' => 'required',
			'email' => 'required|email',
            'phone' => 'required',
		];
	}

	public function authorize()
	{
		return true;
	}
}
