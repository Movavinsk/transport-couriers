<?php namespace Sdcn\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Sdcn\Models\User;

class RejectIfInactivated
{

	use ApiResponseHelper;

	protected $except = [
		'api/register/*',
		'api/user/doctypes',
		'api/auth/guard',
	];

	/**
	 * Handle an incoming request.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @param \Closure                 $next
	 *
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
		$guard = app('Illuminate\Contracts\Auth\Guard');

		if ($request->username) {
			$user = User::whereEmail($request->username)->first();
			//check is the user account has been deactivated, if so throw a 401
			if ($user && $user->isDeactivated()) {
				$target = $user->deactivationTarget();

				return $this->statusUnauthorized()
					->messages('inactivated', 'Login failed, your ' . ($target ? 'account' : 'team') . ' is deactivated.')->respond();
			}
		}

		if (!$this->shouldPassThrough($request) && $guard->check()) {

			$user = $guard->user();

			if ($user->isDeactivated()) {
				$target = $user->deactivationTarget();
				$guard->logout();

				if ($request->ajax() && $user->registration_status == 'incomplete') {
					$guard->login($user);

					return $this->statusOk()->data(['registration_progress' => $user->registration_progress])
						->respond();
				}

				if ($request->ajax()) {
					return $this->statusUnauthorized()
						->messages('inactivated', 'Login failed, your ' . ($target ? 'account' : 'team') . ' is deactivated.')->respond();
				} else {
					return redirect('login');
				}
			}

			if ($user->team && $user->team->is_expired) {
				$guard->logout();
				if ($request->ajax()) {
					return $this->statusUnauthorized()->messages('expired', 'Your team membership has expired.')->respond();
				} else {
					return redirect('login');
				}
			}
		}

		return $next($request);
	}

	protected function shouldPassThrough($request)
	{
		foreach ($this->except as $except) {
			if ($except !== '/') {
				$except = trim($except, '/');
			}

			if ($request->is($except)) {
				return true;
			}
		}

		return false;
	}
}
