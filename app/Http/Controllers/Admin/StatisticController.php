<?php namespace Sdcn\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Sdcn\Http\Controllers\AbstractController;
use Sdcn\Models\Job;
use Sdcn\Models\Team;
use Sdcn\Repositories\LengthAwarePaginator;

class StatisticController extends AbstractController {

    public function getJobsStatistic(){

        $jobStat = [];

        $jobStat["job_monthly_stat"] = Cache::remember('job_monthly_stat', 60, function() {
            return $this->getJobsMonthlyStat();
        });

        return $this->data($jobStat)->respond();
    }

    public function getExpiringMembersStatistic(Request $request)
    {

        $range = $request->filter['expires_in'] ?: 7;

        $result = \DB::table('teams')->where('expire_at', '<', \Carbon\Carbon::now()->addDays($range))
            ->where('expire_at', '>', \Carbon\Carbon::now())
            ->where('is_expired', false)
            ->whereNull('deactivated_at');

        if ($request->sorting) {
            foreach ($request->sorting as $sorting => $order) {
                $result->orderBy($sorting, $order);
            }
        }

        $now = \Carbon\Carbon::now()->format('Y-m-d H:i:s');

        $result->select('id', 'company_name', \DB::raw('DATEDIFF(CAST(expire_at as char), NOW()) AS expire_in_days'));

        $result = $result->get()->all();

        $lap = new LengthAwarePaginator(
            array_slice($result, ($request->count * $request->page) - $request->count, $request->count),
            count($result),
            $request->count,
            $request->page
        );

        $result = $lap->toArray();

        return [
            'data' => $result['data'],
            'paginator' => $result
        ];

    }


    public function getExpiringInsurancesStatistic(Request $request)
    {

        $range = $request->filter['expires_in'] ?: 7;
        $sortingKey = '';

        $result = \DB::table('documents')
            ->join('users', 'users.id', '=', 'documents.user_id')
            ->join('teams', 'users.team_id', '=', 'teams.id')
            ->where('documents.expiry', '<', \Carbon\Carbon::now()->addDays($range))
            ->where('documents.expiry', '!=', '0000-00-00');

        if ($request->sorting) {
            foreach ($request->sorting as $sorting => $order) {
                $result->orderBy($sorting, $order);
                $sortingKey += $sorting . $order;
            }
        }

        $now = \Carbon\Carbon::now()->format('Y-m-d H:i:s');

        $result->select('teams.id', 'teams.company_name', \DB::raw('COUNT(teams.company_name) as expiring_amount'))->groupBy('teams.company_name');

        $result = $result->get()->all();

        $lap = new LengthAwarePaginator(
            array_slice($result, ($request->count * $request->page) - $request->count, $request->count),
            count($result),
            $request->count,
            $request->page);

        $result = $lap->toArray();

        return [
            'data' => $result['data'],
            'paginator' => $result
        ];

    }



    private function getJobsMonthlyStat() {
        try
        {
            $monthlyJobStat = [];
            $monthlyJobResults = Job::where('created_at', '>=', Carbon::now()->subDays(30))->get();

            for($i=0; $i <= 30; $i++) {
                $monthlyJobStat[] = array(Carbon::now()->subDay($i)->timestamp * 1000, 0);
            }

            if(!empty($monthlyJobResults)) {
                foreach($monthlyJobResults as $job) {
                    $monthlyJobStat[Carbon::today()->diffInDays($job->created_at->startOfDay())][1]++;
                }
            }

            return $monthlyJobStat;

        }
        catch (ModelNotFoundException $e)
        {
            return $this->statusNotFound()->respond();
        }
    }

//    public function getUsersStatistic(){
//
//        try {
//            $this->repo->filterBy([
//                'type' => 'user'
//            ], false)->sortBy(['id' => 'desc']);;
//
//            $allUsersResults = $this->repo->get();
//
//            $totalUsers = 0;
//            $totalUsersWeek = 0;
//
//            if (sizeof($allUsersResults) > 0) {
//
//                $i = 0;
//                foreach ($allUsersResults as $result) {
//
//                    if ($i < 7) {
//                        $totalUsersWeek += $result->total;
//                    }
//                    $totalUsers += $result->total;
//                    $i++;
//                }
//            }
//
//            $output = [
//                'totalUsers' => $totalUsers,
//                'totalUsersWeek' => $totalUsersWeek,
//            ];
//
//            $output = [$output];
//
//            return $this->data($output)->respond();
//        }
//        catch (ModelNotFoundException $e)
//        {
//            return $this->statusNotFound()->respond();
//        }
//
//    }

}
