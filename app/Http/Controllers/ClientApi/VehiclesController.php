<?php

namespace Sdcn\Http\Controllers\ClientApi;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\URL;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Sdcn\Models\Vehicle;

class VehiclesController extends Controller
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests, ApiResponseHelper;

    public function index(Vehicle $vehicle)
    {
        $vehicles = $vehicle
            ->select([
                'id',
                'name',
                'png_icon',
            ])
            ->get()
        ;

        return $this->data($vehicles->toArray())->respond();
    }
}
