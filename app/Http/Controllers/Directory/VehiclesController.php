<?php

namespace Sdcn\Http\Controllers\Directory;

use Sdcn\Http\Controllers\Controller;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Sdcn\Models\Team;
use Illuminate\Http\Request;

class VehiclesController extends Controller {

    use ApiResponseHelper;

    public function index(Request $request, Team $team)
    {
        return $this->data($team->vehicles()->toArray())->respond();
    }

}
