<?php namespace Sdcn\Http\Requests\MembersNotes;

use Sdcn\Http\Requests\AbstractFormRequest;

class UpdateRequest extends AbstractFormRequest {

    public function rules()
    {
        return [
            'content' => 'required',
        ];
    }

    public function authorize()
    {
        return true;
    }
}