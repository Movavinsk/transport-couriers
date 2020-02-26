<?php namespace Sdcn\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;

class IsUser {

	use ApiResponseHelper;

	/**
	 * The Guard implementation.
	 *
	 * @var Guard
	 */
	protected $auth;

	/**
	 * Create a new filter instance.
	 *
	 * @param  Guard $auth
	 * @return IsUser
	 */
	public function __construct(Guard $auth)
	{
		$this->auth = $auth;
	}

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
		if ($this->auth->guest())
		{
			return $this->statusUnauthorized()->messages('auth', 'Login before performing this action')->respond();
		}
		return $next($request);
	}
}
