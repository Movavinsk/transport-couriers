<?php namespace Sdcn\Http\Requests\DocumentType;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest {

    public function rules()
    {
        return [
            'name' => 'required'
        ];
    }

    public function authorize()
    {
        return true;
    }
}