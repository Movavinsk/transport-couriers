<?php namespace App\Http\Controllers\Auth;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\PasswordBroker;
use Illuminate\Http\Request;
use App\Http\Controllers\AbstractController;
use App\Models\User;

class PasswordController extends AbstractController
{

    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    /**
     * Create a new password controller instance.
     *
     * @param Guard          $auth
     * @param PasswordBroker $passwords
     *
     * @return PasswordController
     */
    public function __construct(Guard $auth, PasswordBroker $passwords)
    {
        $this->auth = $auth;
        $this->passwords = $passwords;

        $this->middleware('guest');
    }

    /**
     * Send a recover link to the given user.
     *
     * @param Request $request
     *
     * @return Response
     */
    public function postRecover(Request $request)
    {
        $this->validate($request, ['email' => 'required|email']);

        $response = $this->passwords->sendResetLink($request->only('email'), function ($m) {
            $m->subject('Your App password reset link');
        });

        switch ($response) {
            case PasswordBroker::RESET_LINK_SENT:
                return $this->statusOk()->respond();

            case PasswordBroker::INVALID_USER:
                return $this->statusBadRequest()->messages('recover', 'Recover failed, invalid user')->respond();
        }
    }

    /**
     * Reset the given user's password.
     *
     * @param Request $request
     *
     * @return Response
     */
    public function postReset(Request $request)
    {
        $this->validate($request, [
            'token'    => 'required',
            'password' => 'required|confirmed|min:6',
        ]);

        $credentials = $request->only(
            'password', 'password_confirmation', 'token'
        );

        $credentials['email'] = \DB::table(config('auth.passwords.users.table'))
            ->where('token', $credentials['token'])
            ->value('email');

        if ($credentials['email'] == null) {
            return $this->statusBadRequest()->messages('reset', 'Reset failed, token is invalid')->respond();
        }

        $user = User::where('email', $credentials['email'])->first();

        $response = $this->passwords->reset($credentials, function ($user, $password) {
            $user->password = $password;

            $user->save();

            $this->auth->login($user);
        });

        return redirect()->to('/');
    }

    public function forgotPassword($token)
    {
        return view('auth.reset', compact('token'));
    }
}
