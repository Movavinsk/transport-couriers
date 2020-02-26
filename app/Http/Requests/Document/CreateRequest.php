<?php namespace Sdcn\Http\Requests\Document;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
    public function rules()
    {
        return [
            'user_id' => 'required|numeric',
        ];
    }

    public function authorize()
    {
        return true;
    }

}
