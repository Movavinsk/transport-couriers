<?php namespace Sdcn\Http\Requests\Bid;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'job_id' => 'required|numeric',
			'user_id' => 'required|numeric',
			'amount' => 'required|numeric',
		];
	}

	public function authorize()
	{
		return true;
	}

}
