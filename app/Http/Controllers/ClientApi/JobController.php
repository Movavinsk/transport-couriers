<?php

namespace Sdcn\Http\Controllers\ClientApi;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Sdcn\Models\Job;
use Illuminate\Routing\Controller;
use Illuminate\Foundation\Bus\DispatchesJobs;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Sdcn\Models\User;
use Sdcn\Services\GoogleMaps\Geocoding;

class JobController extends Controller
{
    use AuthorizesRequests,
        DispatchesJobs,
        ValidatesRequests,
        ApiResponseHelper;

    public function store(Request $request, Job $job, Geocoding $geocoding)
    {
        $clientId = Authorizer::getResourceOwnerId();
        $user = User::where('oauth_client_id', $clientId)->firstOrFail();

        //check is the user account has been deactivated, if so throw a 401
        if ($user->isDeactivated()) {
            return response()->json([
                'message' => 'Account is deactivated !!',
            ], 401);
        }

        $this->validateRequest($request);
        $data = $request->all();
        $data['user_id'] = $user->id;
        $data['priority'] = 3;

        if (!$request->input('expiry_time')) {
            $data['expiry_time'] = Carbon::now()->addDay();
        }

        $data = $this->getUserDisplayData($data, $geocoding);

        $result = $job->create($data);
        return $this->data([$result])->statusCreated()->respond();
    }

    private function validateRequest($request)
    {
        $this->validate($request, [
            'pickup_point' => 'required',
            'pickup_date' => 'required|date',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'destination_point' => 'required',
            'destination_latitude' => 'required|numeric',
            'destination_longitude' => 'required|numeric',
            'destination_date' => 'required|date',
            'vehicle_id' => 'required|integer',
        ]);
    }

    private function getUserDisplayData($data, Geocoding $geocoding)
    {
        $pickupLocation = $geocoding->getAddressFromCoordinates($data['pickup_latitude'], $data['pickup_longitude']);

        if ($this->hasAddressComponents($pickupLocation)) {
            foreach ($pickupLocation->results[0]->address_components as $addressComponent) {
                if ($addressComponent->types[0] == 'postal_code') {
                    $data['pickup_postcode_prefix'] = $this->getPostcodePrefix($addressComponent);
                }
                if ($addressComponent->types[0] == 'postal_town') {
                    $data['pickup_town'] = $addressComponent->short_name;
                }
            }
        }

        $destinationLocation = $geocoding->getAddressFromCoordinates($data['destination_latitude'], $data['destination_longitude']);

        if ($this->hasAddressComponents($destinationLocation)) {
            foreach ($destinationLocation->results[0]->address_components as $addressComponent) {
                if ($addressComponent->types[0] == 'postal_code') {
                    $data['destination_postcode_prefix'] = $this->getPostcodePrefix($addressComponent);
                }
                if ($addressComponent->types[0] == 'postal_town') {
                    $data['destination_town'] = $addressComponent->short_name;
                }
            }
        }

        return $data;
    }

    private function getPostcodePrefix($postcode)
    {
        $splitPostcode = explode(' ', $postcode->short_name, 2);
        return $splitPostcode[0];
    }

    private function hasAddressComponents($location)
    {
        if (isset($location->results)
            && array_key_exists(0, $location->results)
            && isset($location->results[0]->address_components)) {
            return true;
        }

        return false;
    }
}
