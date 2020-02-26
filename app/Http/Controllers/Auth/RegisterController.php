<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;
//--from 5.3
use Sdcn\Http\Controllers\Helpers\ApiResponseHelper;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Sdcn\Models\Document;
use Sdcn\Models\Team;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;
    //--from 5.3
    use ApiResponseHelper, ValidatesRequests, AuthorizesRequests;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }
    //--from 5.3
    public function register(Request $request, \Sdcn\Models\User $user)
    {
        $this->validateNewUser($request);

        $user->name_first = $request->first_name;
        $user->name_last = $request->last_name;
        $user->phone = $request->phone;
        $user->email = $request->email;
        $user->registration_status = 'incomplete';
        $user->inactivated = true;
        $user->save();

        return $this->data([$user])->statusCreated()->respond();
    }

    public function getTeamList()
    {
        $teams = Team::whereNull('deactivated_at')->get()
            ->map(function ($team) {
                return [
                    'id'           => $team->id,
                    'company_name' => $team->company_name,
                ];
            });

        return $this->data($teams->toArray())->respond();
    }

    public function getTeamId(Request $request)
    {
        $team = Team::where('company_name', $request->company_name)->first();

        return $this->data(['company_id' => $team->id])->respond();
    }

    public function storeTeam(Request $request, Team $team)
    {
        $this->validateNewTeam($request);

        $user = Auth()->user();

        if ($request->team_id) {
            $user->team_id = $request->team_id;
            $user->save();

            return $this->data([
                'user_id'              => $user->id,
                'team_id'              => $user->team_id,
                'skip_company_address' => true,
            ])->respond();
        }

        $data = $request->input();
        $data['is_expired'] = true;

        $team = $team->create($data);
        $team->deactivated_at = Carbon::now();
        $team->save();

        $user->team_id = $team->id;
        $user->save();

        $this->updateRegistrationProgress($request);

        return $this->data([
            'user_id'              => $user->id,
            'team_id'              => $user->team_id,
            'skip_company_address' => false,
        ])->respond();
    }

    public function updateTeam(Request $request)
    {
        $team = Team::find($request->team_id);
        $team->fill($request->all());
        $team->save();

        $this->updateRegistrationProgress($request);

        return $this->data([
            'user_id' => Auth::user()->id,
            'team_id' => $team->id,
        ])->respond();
    }

    public function check(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return $this->statusUnauthorized()
                ->messages('inactivated', 'Login before performing this action')
                ->respond();
        }

        $data = [
            'user_id'               => $user->id,
            'team_id'               => $user->team_id,
            'registration_status'   => $user->registration_status,
            'registration_progress' => $user->registration_progress,
        ];

        return $this->data($data)->respond();
    }

    public function getDocumentList()
    {
        $user = Auth::user();

        if (!$user) {
            return $this->statusUnauthorized()
                ->messages('inactivated', 'Login before performing this action')
                ->respond();
        }

        $latestDocumentIds = $user->documents()
            ->groupBy('type_id')
            ->selectRaw("MAX(documents.id)")
            ->get()
            ->map(function ($document) {
                return $document->{"MAX(documents.id)"};
            })->toArray();

        $latestDocuments = Document::find($latestDocumentIds);

        return $this->data($latestDocuments->toArray())->respond();
    }

    public function updateRegistrationProgress(Request $request)
    {
        if ($request->registration_progress) {
            $user = Auth::user();
            $user->registration_progress = $request->registration_progress;

            if ($request->registration_progress == 'complete') {
                $user->registration_status = 'complete';
                $this->mailAdminNewUserRegistered($user);
            }

            $user->save();
        }
    }

    private function validateNewUser(Request $request)
    {
        $this->validate($request, [
            'first_name' => 'required',
            'last_name'  => 'required',
            'phone'      => 'required',
            'email'      => 'unique:users,email',
        ]);
    }

    private function validateNewTeam(Request $request)
    {
        if ($request->team_id) {
            return;
        }

        $this->validate($request, [
            'company_name'   => 'required|unique:teams,company_name',
        ]);
    }

    private function mailAdminNewUserRegistered(User $user)
    {
        if ($user->registration_email_sent) {
            return;
        }

        $user->registration_email_sent = true;
        $user->save();

        Mail::send('emails.user.registration-complete', [
            'user' => $user,
        ], function ($message) {
            $message->to('info@samedaycouriernetwork.com', 'Admin')
                ->subject('SDCN - A user has completed registration');
        });
    }
}
