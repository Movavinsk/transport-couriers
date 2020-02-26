<?php

namespace Sdcn\Http\Controllers\Admin;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Models\Partner;
use Sdcn\Http\Controllers\Helpers\ListHelper;
use Sdcn\Http\Controllers\Helpers\StoreHelper;
use Sdcn\Http\Controllers\Helpers\ShowHelper;
use Sdcn\Http\Controllers\Helpers\UpdateHelper;
use Sdcn\Http\Controllers\Helpers\DestroyHelper;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Repositories\Contracts\PartnerRepositoryInterface;

/**
 * Class LocationController
 * @package Sdcn\Http\Controllers
 */
class PartnersController extends AbstractController
{
    use ListHelper;
    use ShowHelper;
    use StoreHelper;
    use UpdateHelper;
    use DestroyHelper;

    /**
     * @var PartnerRepositoryInterface
     */
    public $repo;

    /**
     * @var array
     */
    public $with = ['benefits'];

    /**
     * @param PartnerRepositoryInterface $repo
     */
    function __construct(PartnerRepositoryInterface $repo)
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




    public function uploadLogo(Request $request, $id)
    {
        if(! $request->hasFile('file') || ! $request->file('file')->isValid()) {

            return response()->json(array('status' => 'error'), 404);

        }

        $partner = Partner::findOrFail($id);

        $file = $request->file('file');

        $file_name = $id . "." . $file->getClientOriginalExtension();

        if (!$file->move(public_path() . config('info.upload_path.partners_logos'), $file_name)) {

            die("Unable to move file.");

        }

        $partner->logo = config('info.upload_path.partners_logos') . $file_name;

        $partner->save();

        return response()->json([
            'status' => 'success',
            'data' => [
                "avatar" => $partner->logo
            ]
        ], 201);

    }

}
