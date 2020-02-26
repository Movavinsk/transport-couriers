<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\UserRepositoryInterface;

/**
 * Class UserController
 * @package Sdcn\Http\Controllers
 */
class UserController extends AbstractController
{
    use ShowHelper;
	use StoreHelper;
	use UpdateHelper {
		update as helperUpdate;
	}

	protected $auth;

	/**
	 * @var UserRepositoryInterface
	 */
	public $repo;

	/**
	 * @param Guard $auth
	 * @param UserRepositoryInterface $repo
	 */
	function __construct(Guard $auth, UserRepositoryInterface $repo, Request $request)
	{
		$this->auth = $auth;
		$this->repo = $repo;
        $this->request = $request;
	}

    public function index(Request $request, $api = true)
    {
        $repo = $this->prepareRepositoryPagination($request);
        $repo->make();
        $repo->filterBy($request->get('filters', []));
        $repo->limitByPublicDetails();
        $repo->hideCurrentUser();

        $result = $repo->get();
        $result->getCollection()->load('team');

        return $this->data($result->toArray()['data'])->paginator($result)->respond();
    }

	public function show($api = true)
	{
		$args = func_get_args();
		$user = array_pop($args);
		
		try
		{
			return $this->data($user->toArray())->respond();
		}
		catch (ModelNotFoundException $e)
		{
			return $this->statusNotFound()->respond();
		}
	}

	public function update(AbstractFormRequest $request, $api = true)
	{
		$args = func_get_args();
		$id = array_pop($args)->id;

		return call_user_func_array([$this, 'helperUpdate'], func_get_args());
	}

    public function getResourceUpdateValues()
    {
        return $this->request->except('roles', 'roles_ids');
    }

    public function updateLocation(Request $request)
    {
        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $user = User::find(Authorizer::getResourceOwnerId());

        if ($user->last_latitude != round($latitude, 7) || $user->last_longitude != round($longitude, 7)) {
            $user->last_latitude = $latitude;
            $user->last_longitude = $longitude;
            $user->save();

            $user->sendNotificationForJobsInArea();
        }

        return $this->statusCode(200)->respond();
    }

    public function updateFcmToken(Request $request)
    {
        $userId = Authorizer::getResourceOwnerId();
        $user = User::find($userId);
        $fcmToken = $request->fcm_token;
        $user->fcm_token = $fcmToken;
        $user->save();

        return $this->statusCode(200)->respond();
    }

    public function authenticate(Request $request)
    {
        if (!Auth::user()) {
            Auth::loginUsingId(Authorizer::getResourceOwnerId());
        }
        $redirect = $request->get('redirect_to');

        return redirect($redirect);
    }

    public function me(User $user)
    {
        return $user->find(Authorizer::getResourceOwnerId());
    }

}
