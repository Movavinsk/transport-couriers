<?php namespace Sdcn\Http\Requests\Invoice;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'job_id' => 'required|numeric',
			'invoice_date' => 'required',
			'amount' => 'numeric|nullable',
		];
	}

	public function authorize()
	{
		return true;
	}

}
