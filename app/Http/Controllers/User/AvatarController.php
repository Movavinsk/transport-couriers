<?php namespace Sdcn\Http\Controllers\User;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Sdcn\Models\User;
use Response;

/**
 * Class DocumentController
 * @package Sdcn\Http\Controllers
 */
class AvatarController extends BaseController
{

    public function store (Request $request) {

        $user = User::findOrFail($request->get('user_id'));

        if( $user && $request->hasFile('file') && $request->file('file')->isValid() )
        {
            $file = $request->file('file');

            $file_name = $request->get('user_id') . "." . $file->getClientOriginalExtension();

            $file->move(public_path() . config('info.upload_path.avatar'), $file_name);

            $user->avatar = config('info.upload_path.avatar') . $file_name;

            $user->save();

            return Response::json(array('status' => 'success', 'data' => array("avatar" => $user->avatar)), 201);
        }else{
            return Response::json(array('status' => 'error'), 404);
        }
    }
}
