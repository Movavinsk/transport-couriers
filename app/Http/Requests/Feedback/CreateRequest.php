<?php namespace Sdcn\Http\Requests\Feedback;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\Request;
use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{

	/**
	 * @var Guard
	 */
	private $guard;

	private $base_request;

	public function __construct(Guard $guard, Request $request)
	{

		$this->guard = $guard;
		$this->base_request = $request;
	}

	public function rules()
	{
		return [];
	}

	public function authorize()
	{
		return in_array($this->guard->user()->getAuthIdentifier(), $this->base_request->job->getExtendedParticipants());
	}
}
