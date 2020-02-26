<?php

namespace Sdcn\Http\Controllers\Admin\Team;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\NoteRepository;

/**
 * Class NoteController
 * @package Sdcn\Http\Controllers
 */
class MembersNotesController extends AbstractController
{
    use ResourceHelper;

    /**
     * @var NoteRepositoryInterface
     */
    public $repo;

    /**
     * @var array
     */
    protected $with = ['user'];

    /**
     * @param NoteRepositoryInterface $repo
     */
    public function __construct(NoteRepository $repo)
    {
        $this->repo = $repo;
    }

    public function show($api = true)
    {
        $args = func_get_args();

        $last = array_pop($args);

        try
        {
            $result = $this->repo->find($last);

            if($api)
            {
                return $this->data($result->toArray())->respond();
            }
            else
            {
                return $result;
            }
        }
        catch (ModelNotFoundException $e)
        {
            if($api)
            {
                return $this->statusNotFound()->respond();
            }
            else
            {
                return false;
            }
        }
    }

    public function update(AbstractFormRequest $request, $api = true)
    {
        // On all (plain/nested) routes, We need the last id on nested chain to perform update.
        // mysql ids are sufficient to reach any level of child, so we just grab the last argument.
        //eg: companies/5/contacts/63, here contact 63 will always reach same child regardless of parent company 5.*
        $args = func_get_args();

        $last = array_pop($args);

        $updatedData = $this->getResourceUpdateValues($request);

        $this->repo->update($last, $updatedData);
        if($api)
        {
            return $this
                ->messages('update', 'Updated successfully!')
                ->statusUpdated()
                ->respond();
        }
        else
        {
            return true;
        }
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