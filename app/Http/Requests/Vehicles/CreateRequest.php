<?php

namespace Sdcn\Http\Requests\Vehicles;

use Sdcn\Http\Requests\AbstractFormRequest;

class CreateRequest extends AbstractFormRequest
{
    public function rules()
    {
        return [
            // 'vehicle.id' => 'required',
        ];
    }

    public function authorize()
    {
        return true;
    }

}
