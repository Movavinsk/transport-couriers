<?php namespace Sdcn\Http\Requests\Member;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest {

    public function rules()
    {
        return [
            'name_first' => 'required',
            'name_last' => 'required',
            'email' => 'required|email|unique:users',
            'phone' => 'required',
        ];
    }

    public function authorize()
    {
        return true;
    }
}