<?php namespace Sdcn\Http\Requests\MembersNotes;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest {

    public function rules()
    {
        return [
            'content' => 'required',
            'user_id' => 'required|exists:users,id',
            'team_id' => 'required|exists:teams,id',
        ];
    }

    public function authorize()
    {
        return true;
    }
}