<?php namespace Sdcn\Repositories\Contracts;

use Sdcn\Models\Team;

interface JobRepositoryInterface extends AbstractRepositoryInterface
{
    public function filterByTeamId($teamId);
    public function filterWhereTeamBidded(Team $team);
    public function eagerLoadTeamBid(Team $team);
    public function postedByTeamMembers($team_id);
}
