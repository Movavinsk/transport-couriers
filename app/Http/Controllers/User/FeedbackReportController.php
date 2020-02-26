<?php

namespace Sdcn\Http\Controllers\User;

use Sdcn\Models\Team;
use Illuminate\Http\Request;
use Sdcn\Http\Controllers\AbstractController;
use Illuminate\Routing\Controller as BaseController;

class FeedbackReportController extends AbstractController
{

    public function index(Request $request, $api = true)
    {
        $team = Team::find($request->team_id)
            ->load('feedback.sender', 'feedback.owner');

        return $this->data($team->toArray())->respond();
    }

}