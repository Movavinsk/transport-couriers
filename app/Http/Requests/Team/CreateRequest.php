<?php namespace Sdcn\Http\Requests\Team;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest {

    /**
     * @var Guard
     */
    private $guard;

    public function __construct(Guard $guard)
    {
        $this->guard = $guard;
    }

    public function rules()
    {
        return [
            'company_name' => 'required',
            'company_number' => 'required',
            'invoice_recipient_email' => 'email|nullable',
        ];
    }

    public function authorize()
    {
        return $this->guard->user()->hasRole("admin");
    }
}
