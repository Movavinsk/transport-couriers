<?php

namespace Sdcn\Http\Controllers\User;

use Carbon\Carbon;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Models\Job;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Models\User;
use Sdcn\Models\Values\EarthPoint;
use Illuminate\Http\Request;

class NotificationsController extends AbstractController
{
    public function nearby(Request $request)
    {
        $user = User::find(Authorizer::getResourceOwnerId());
        $lat = $user->last_latitude;
        $long = $user->last_longitude;

        $point = new EarthPoint($lat, $long);

        $jobs = Job::nearbyJobs($point)->where('user_id', '!=', $user->id)->get();

        return response()->json(['jobs' => $jobs]);
    }
}