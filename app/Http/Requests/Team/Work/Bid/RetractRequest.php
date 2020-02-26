<?php namespace Sdcn\Http\Requests\Team\Work\Bid;

use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Requests\AbstractFormRequest;

class RetractRequest extends AbstractFormRequest {

    /**
     * @var Guard
     */
    protected $guard;

    public function __construct(Guard $guard)
    {
        $this->guard = $guard;
    }

    public function rules()
    {
        return [];
    }

    public function authorize()
    {
        // seems like the $bid->user access is hacked, we can't rely on it
        return $this->bid->user()->first()->isTeammate($this->guard->user());
    }
}