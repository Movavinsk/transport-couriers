<?php namespace Sdcn\Http\Controllers\Admin\Team;

use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Http\Controllers\Helpers\ResourceHelper;
use Sdcn\Http\Requests\AbstractFormRequest;
use Sdcn\Repositories\TeamRepository;
use Illuminate\Http\Request;
use Sdcn\Models\Team;

class TeamController extends AbstractController {

    use ResourceHelper;

    /**
     * @var TeamRepository
     */
    protected $repo;

    public function __construct(TeamRepository $repo)
    {
        $this->repo = $repo;
        $this->repo->with(['primaryMember', 'members', 'invoiceUserRecipient']);
    }

    public function teamlist()
    {
        return ['data' => \DB::table('teams')->get()];
    }

    public function uploadLogo(Request $request, $id)
    {
        if(! $request->hasFile('file') || ! $request->file('file')->isValid()) {

            return response()->json(array('status' => 'error'), 404);

        }

        $team = Team::findOrFail($id);

        $file = $request->file('file');

        $file_name = $id . "." . $file->getClientOriginalExtension();

        if (!$file->move(public_path() . config('info.upload_path.logos'), $file_name)) {

            die("Unable to move file.");

        }

        $team->logo = config('info.upload_path.logos') . $file_name;

        $team->save();

        return response()->json([
            'status' => 'success',
            'data' => [
                "avatar" => $team->logo
            ]
        ], 201);

    }
}