<?php namespace Sdcn\Http\Requests\Job;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
	public function rules()
	{
		return [
			'pickup_point' => 'required',
			'pickup_date' => 'required|date',
			'pickup_latitude' => 'required|numeric',
			'pickup_longitude' => 'required|numeric',
			'destination_point' => 'required',
			'destination_latitude' => 'required|numeric',
			'destination_longitude' => 'required|numeric',
			'destination_date' => 'required|date',
			'vehicle_id' => 'required|integer',
			'user_id' => 'required|integer',
			'expiry_time' => 'required|date',
		];
	}

	public function authorize()
	{
		return true;
	}

}
