<?php namespace Sdcn\Http\Requests\MembersDocuments;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
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
