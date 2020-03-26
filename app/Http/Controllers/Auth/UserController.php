<?php namespace App\Http\Controllers\Auth;

use Auth;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Http\Controllers\AbstractController;
use App\Http\Middleware\RejectIfInactivated;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;

class UserController extends AbstractController {

	/*
	|--------------------------------------------------------------------------
	| User Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the authentication of existing users.
	|
	*/

	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  Guard $auth
	 * @return UserController
	 */
	public function __construct(Guard $auth)
	{
		$this->auth = $auth;

		$this->middleware('guest', ['only' => 'postLogin']);

		$this->middleware('auth', ['except' => ['postLogin', 'check']]);
	}

	/**
	 * @todo Pass X-CSRF-TOKEN in headers to allow CSRF verification
	 * We need safe way to deliver this to client applications
	 */
	public function getToken()
	{
		return csrf_token();
	}

	/**
	 * Check logged on user
	 */
	public function getCurrent()
	{
		return $this->data($this->auth->user()->load('roles', 'roles.perms')->toArray())->respond();
	}

	/**
	 * Perform login action
	 *
	 * @param Request $request
	 * @return Response
	 */
	public function postLogin(Request $request)
	{
		$this->validate($request, [
			'email' => 'required|email', 'password' => 'required',
		]);

		$credentials = $request->only('email', 'password');

		if ($this->auth->attempt($credentials, $request->has('remember')))
		{
			if($this->auth->user()->isDeactivated()) {

			    if ($this->auth->user()->registration_status == 'incomplete') {
                    return $this->statusOk()
                        ->data(['registration_progress' => $this->auth->user()->registration_progress])
                        ->respond();
                }

                $response = $this->statusBadRequest()
                    ->messages('login', 'Login failed, your '.$this->auth->user()->deactivationTarget().' is deactivated.');

				$this->auth->logout();
				return $response->respond();
			}

            if($this->auth->user()->team->is_expired) {
                $response = $this->statusBadRequest()->messages('login', 'Your team membership has expired.');
                $this->auth->logout();
                return $response->respond();
            }

			return $this->data($this->auth->user()->load('roles', 'roles.perms')->toArray())->messages('login', 'Logged in successfully')->respond();
		}

		return $this->statusBadRequest()->messages('login', 'Login failed, invalid email password combination')->respond();
	}

	/**
	 * Perform logout
	 *
	 * @return Response
	 */
	public function getLogout()
	{
		$this->auth->logout();

		return $this->messages('logout', 'Logged out successfully')->respond();
	}


	public function check()
	{
		$data = ['out' => false];

		if(!$this->auth->check())
        {
			$data = ['out' => true, 'message' => 'Your session has expired, please login again.'];
		}
		elseif($this->auth->user()->isDeactivated())
        {
			$data = ['out' => true, 'message' => 'Your '.$this->auth->user()->deactivationTarget().' is deactivated.'];
			$this->auth->logout();
		}
		elseif ($this->auth->user()->registration_status != 'incomplete') {
            if ($this->auth->user()->team->is_expired)
                {
                $data = ['out' => true, 'message' => 'Your team membership has expired.'];
                $this->auth->logout();
            }
        }

		return $this->data($data)->respond();
	}

	public function oAuthLogin($username, $password)
	{
		$credentials = [
			'email'    => $username,
			'password' => $password,
		];

		if (Auth::once($credentials)) {
			return Auth::user()->id;
		}

		return false;
	}

}
