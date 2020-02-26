<?php namespace Sdcn\Handlers\Events;


use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Job;
use Sdcn\Models\SentJobNotification;
use Sdcn\Models\User;

class NewJobPosted implements ShouldQueue {

    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param  Job $job
     * @return void
     */
    public function handle(Job $job)
    {
        // Handle situation where a job has been allocated rather than posted
        if ($job->status == 'progress') {
            $this->sendAllocatedJobEmails($job);
            return;
        }

        // LIST OF USERS THAT WILL GET AN ALERT
        $alert_list = collect([]);

        $haversine = new \Illuminate\Database\Query\Expression("(3959 * acos(cos(radians($job->pickup_latitude)) * cos(radians(latitude)) * cos(radians(longitude)-radians($job->pickup_longitude))+sin( radians($job->pickup_latitude))* sin(radians(latitude))))");

        // all locations my vehicles only
        $allLocationsVehicleOnly = \DB::table('users')
            ->join('user_vehicle', 'user_vehicle.user_id', '=', 'users.id')
            ->join('vehicles', 'user_vehicle.vehicle_id', '=', 'vehicles.id')
            ->where('vehicles.size', '=', $job->vehicle->size)
            ->where('users.settings', 'like', '%"vehicle_type":"vehicle_only"%')
            ->where('users.settings', 'like', '%"location":"all"%')
            ->select('users.email')
            ->distinct()
            ->pluck('email');

        // all locations all vehicles
        $allVehiclesAllLocations = \DB::table('users')
            ->where('users.settings', 'like', '%"vehicle_type":"all"%')
            ->where('users.settings', 'like', '%"location":"all"%')
            ->select('users.email')
            ->distinct()
            ->pluck('email');

        // all locations custom vehicle size
        $byCustomVanSizeAllLocations = \DB::table('users')
            ->where('users.settings', 'like', '%"location":"all"%')
            ->where('settings', 'like', '%"vehicle_type":"custom"%')
            ->select(\DB::raw("CAST(SUBSTRING(`settings`, LOCATE('min', `settings`) + 5, 3) AS UNSIGNED) as custom_min, CAST(SUBSTRING(`settings`, LOCATE('max', `settings`) + 5, 4) AS UNSIGNED) as custom_max"), 'users.email')
            ->having('custom_min', '<=', $job->vehicle->size)
            ->having('custom_max', '>=', $job->vehicle->size)
            ->pluck('email');

        // location only
        $byDistance = \DB::table('locations')
            ->whereRaw($haversine . " < locations.miles")
            ->join('users', 'locations.user_id', '=', 'users.id')
            ->leftJoin('user_vehicle', 'user_vehicle.user_id', '=', 'users.id')
            ->leftJoin('vehicles', 'user_vehicle.vehicle_id', '=', 'vehicles.id')
            ->where(function($query) use($job, $haversine) {
                $query->join('users', 'locations.user_id', '=', 'users.id')
                    ->leftJoin('user_vehicle', 'user_vehicle.user_id', '=', 'users.id')
                    ->leftJoin('vehicles', 'user_vehicle.vehicle_id', '=', 'vehicles.id')
                    ->where('users.settings', 'like', '%"vehicle_type":"all"%')
                    ->where('users.settings', 'like', '%"location":"location_only"%')
                    ->whereRaw($haversine . " <= locations.miles");
            })
            ->orWhere(function($query) use($job, $haversine) { // vehicle_only
                $query->join('users', 'locations.user_id', '=', 'users.id')
                    ->leftJoin('user_vehicle', 'user_vehicle.user_id', '=', 'users.id')
                    ->leftJoin('vehicles', 'user_vehicle.vehicle_id', '=', 'vehicles.id')
                    ->where('vehicles.size', '=', $job->vehicle->size)
                    ->where('users.settings', 'like', '%"vehicle_type":"vehicle_only"%')
                    ->whereRaw($haversine . " <= locations.miles");
            })
            ->select('users.email')
            ->distinct()
            ->pluck('email');

        // locations only custom vehicle size
        $byCustomVanSizeOwnedLocations = \DB::table('locations')
            ->whereRaw($haversine . " < locations.miles")
            ->join('users', 'locations.user_id', '=', 'users.id')
            ->where('users.settings', 'like', '%"location":"location_only"%')
            ->where('settings', 'like', '%"vehicle_type":"custom"%')
            ->select(\DB::raw("CAST(SUBSTRING(`settings`, LOCATE('min', `settings`) + 5, 3) AS UNSIGNED) as custom_min, CAST(SUBSTRING(`settings`, LOCATE('max', `settings`) + 5, 4) AS UNSIGNED) as custom_max"), 'users.email')
            ->having('custom_min', '<=', $job->vehicle->size)
            ->having('custom_max', '>=', $job->vehicle->size)
            ->pluck('email');

        $recipients = collect($allLocationsVehicleOnly)
            ->merge(collect($allVehiclesAllLocations))
            ->merge(collect($byDistance))
            ->merge(collect($byCustomVanSizeAllLocations))
            ->merge(collect($byCustomVanSizeOwnedLocations))
            ->unique();

        $users = User::whereIn('email', $recipients)
            ->with('sentJobNotifications')
            ->where('team_id', '!=', $job->team_id)
            ->where('inactivated', false);

        foreach ($users->get() as $user) {
            $userNotificationForCurrentJob = $user->sentJobNotifications->where('job_id', $job->id);

            // Only email the user if a notification has not yet been sent
            if (!$userNotificationForCurrentJob->count()) {
                Event::forceCreate(array(
                    "user_id" => $user['id'],
                    "name" => "New Job #$job->id in your area",
                    "description" => "From: " . $job->pickup_town . ", To: " . $job->destination_town,
                    "status" => "new",
                    "type" => "feedback"
                ));

                $this->sendJobPostedEmail($user, $job, 'emails.jobs.job-within-range');
            }
        }
    }

    /**
     * @param Job  $job
     * @param User $allocatedUser
     */
    private function sendAllocatedJobEmails(Job $job)
    {
        $sender = $job->user;
        $allocatedDriver = $job->bid->user;

        $this->sendJobPostedEmail($sender, $job, 'emails.jobs.allocated-requester');
        $this->sendJobPostedEmail($allocatedDriver, $job, 'emails.jobs.allocated-driver');
    }

    private function sendJobPostedEmail(User $user, Job $job, $emailTemplate)
    {
        DB::transaction(function () use ($user, $job, $emailTemplate) {

            Mail::send($emailTemplate, [
                'job'  => $job,
                'user' => $user,
            ], function ($message) use ($job, $user) {
                $message
                    ->to($user['email'], $user['name_full'])
                    ->subject("SDCN Load Alert - $job->pickup_town $job->pickup_postcode_prefix to $job->destination_town $job->destination_postcode_prefix");
            });

            SentJobNotification::create([
                'user_id' => $user->id,
                'job_id'  => $job->id,
                'type' => SentJobNotification::EMAIL_NOTIFICATION,
            ]);
        });

    }
}
