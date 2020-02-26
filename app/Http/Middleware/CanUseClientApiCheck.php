<?php

namespace Sdcn\Http\Middleware;

use Closure;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Models\User;

class CanUseClientApiCheck
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     *
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $clientId = Authorizer::getResourceOwnerId();
        $user = User::where('oauth_client_id', $clientId)->first();

        if (!$user || $user->can_use_client_api == false) {
            return response()->json([
                'error' => 'You have not been authorised to use the client api, please contact a Same Day Courier Network admin',
            ], 401);
        }

        return $next($request);
    }
}
