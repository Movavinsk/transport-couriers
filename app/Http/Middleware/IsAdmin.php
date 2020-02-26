<?php namespace Sdcn\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;

class IsAdmin {

	use ApiResponseHelper;

	protected $auth;

	public function __construct(Guard $auth)
	{
		$this->auth = $auth;
	}

	public function handle($request, Closure $next)
	{
		if ($this->auth->guest())
		{
			return $this->statusUnauthorized()->messages('auth', 'Login before performing this action')->respond();
		}

		$user = $this->auth->user();

		if ( ! $user->hasRole('admin') )
		{
			return $this->statusUnauthorized()->messages('auth', 'Login as Admin before performing this action')->respond();
		}
		return $next($request);
	}
}
