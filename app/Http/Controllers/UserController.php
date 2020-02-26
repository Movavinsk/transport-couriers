<?php namespace Sdcn\Http\Controllers;

use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\User;
use Sdcn\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Class UserController
 * @package Sdcn\Http\Controllers
 */
class UserController extends AbstractController
{
	use Helpers\ResourceHelper;

	/**
	 * @var UserRepositoryInterface
	 */
	public $repo;

	/**
	 * @param UserRepositoryInterface $repo
	 */
	function __construct(UserRepositoryInterface $repo)
	{
		$this->repo = $repo;
        $repo->with(['roles', 'roles.perms']);
	}

	public function avatar($id)
	{
		try
		{
			$user = $this->repo->find($id);
			$initials = substr($user->name_first, 0, 1) . " " . substr($user->name_last, 0, 1);

			$img = \Image::canvas(128, 128, '#ccc');
			$img->text($initials, 64, 64, function($font) {
				$font->file(public_path() . '/assets/fonts/sourcesanspro/sourcesanspro-regular.ttf');
				$font->size(48);
				$font->color('#fff');
				$font->align('center');
				$font->valign('center');
			});
			return $img->response();
		}
		catch (ModelNotFoundException $e)
		{
			return $this->statusNotFound()->respond();
		}
	}

    public function oAuthClientDetails($user)
    {
        $oauthClient = $user->oauthClient;
        if (!$oauthClient) {
            return $this->data(['oauth_client' => []])->respond();
        }
        return $this->data($oauthClient->toArray())->respond();
	}

    public function update(AbstractFormRequest $request, $api = true)
    {
        $args = func_get_args();

        $last = array_pop($args);

        $updatedData = $this->getResourceUpdateValues($request);

        $this->repo->update($last->id, $updatedData);

        $this->repo->saveUserRoles($last, $updatedData['roles_ids']);

        $this->updateRegistrationStatus($updatedData);

        if ($api) {
            return $this
                ->messages('update', 'Updated successfully!')
                ->statusUpdated()
                ->respond();
        } else {
            return true;
        }
    }

    /**
     * @param $updatedData
     */
    private function updateRegistrationStatus($updatedData)
    {
        if (!$updatedData['inactivated'] && $updatedData['registration_status'] == 'incomplete') {
            $user = $this->repo->find($updatedData['id']);
            $user->registration_progress = 'complete';
            $user->registration_status = 'backend';
            $user->save();
        }
    }
}
