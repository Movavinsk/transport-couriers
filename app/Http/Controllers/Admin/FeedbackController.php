<?php namespace Sdcn\Http\Controllers\Admin;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\ListOwnedHelper;
use Sdcn\Repositories\Contracts\FeedbackRepositoryInterface;
use Illuminate\Http\Request;

class FeedbackController extends AbstractController {

    use ListHelper, DestroyHelper;

    /**
     * @var FeedbackRepositoryInterface
     */
    public $repo;

    protected $with = ['sender', 'owner'];

    /**
     * @param FeedbackRepositoryInterface $repo
     */
    function __construct(FeedbackRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function getOwningControlColumn()
    {
        return 'owner_id';
    }

    public function destroy($api = true)
    {
        $args = func_get_args();

        $last = array_pop($args);

        $result = $this->repo->delete($last);

        if($api)
        {
            if(!$result)
            {
                return $this->statusBadRequest()->respond();
            }
            else
            {
                return $this->statusDeleted()->respond();
            }
        }
        else
        {
            return $result;
        }
    }
}