<?php namespace Sdcn\Http\Requests\Member;

use Sdcn\Http\Requests\AbstractFormRequest;

class UpdateRequest extends AbstractFormRequest {

    public function rules()
    {
        return [

        ];
    }

    public function authorize()
    {
        return true;
    }
}