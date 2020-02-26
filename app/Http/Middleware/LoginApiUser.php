<?php

namespace Sdcn\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use LucaDegasperi\OAuth2Server\Exceptions\NoActiveAccessTokenException;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Models\User;

class LoginApiUser
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
        try {
            $apiUserId = Authorizer::getResourceOwnerId();
        } catch (NoActiveAccessTokenException $e) {
            return response()->json([
                'error' => 'No active access token contained in request',
            ], 401);
        }

        $user = User::findOrFail($apiUserId);
        //check is the user account has been deactivated, if so throw a 401
        if ($user->isDeactivated()) {
            return response()->json([
                'message' => 'Account is deactivated!!',
            ], 401);
        }

        if (!Auth::user()) {
            Auth::loginUsingId($apiUserId);
        }

        return $next($request);
    }
}
