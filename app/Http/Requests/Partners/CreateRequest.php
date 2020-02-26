<?php

namespace Sdcn\Http\Requests\Partners;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
    public function rules()
    {
        return [
            // 'job_id' => 'required|numeric',
            // 'recipient' => 'required',
            // 'delivery_date' => 'required'
        ];
    }

    public function authorize()
    {
        return true;
    }

}
