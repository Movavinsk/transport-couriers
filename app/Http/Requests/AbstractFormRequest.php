<?php namespace Sdcn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class AbstractFormRequest extends FormRequest {

	//

    /**
     * Determine if the current request is asking for JSON in return.
     *
     * @return bool
     */
    public function wantsJson()
    {
        if($this->get('wantsJson')) {
            return true;
        }

        return parent::wantsJson();
    }
}
