<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Job;
use Sdcn\Models\User;

class BidAccepted {

	/**
	 * Handle the event.
	 *
	 * @param  Job  $job
	 * @return void
	 */
	public function handle(Job $job)
	{
        $requester = $job->user_info;

        $driver = $job['bid']['user'];

        Event::forceCreate(array(
            "user_id" => $job->bid_user_id,
            "name" => "Your bid was accepted",
            "description" => "Job: #" . $job->id . ", Amount: £" . $job['bid']['amount'],
            "status" => "new",
            "type" => "trivial"
        ));

        Event::forceCreate(array(
            "user_id" => Auth::user()->id,
            "name" => "Accepted bid",
            "description" => "Job: #" . $job->id . ", Amount: £" . $job['bid']['amount'],
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::queue('emails.bids.accepted-requester', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($requester, $driver, $job)
        {
            $message->to($requester['email'], $requester['name_full'])->subject('SDCN - Job #' . $job->id . ' is Allocated');
        });

        Mail::send('emails.bids.accepted-driver', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job
        ], function($message) use ($requester, $driver, $job)
        {
            $message->to($driver['email'], $driver['name_full'])->subject('SDCN - Your Bid on Job #' . $job->id . ' has Been Accepted');
        });

        //
        //  Send notification to rejected bidders
        //

        $rejected_bidders_ids = $job->bids->pluck('user_id')->reject(function($item) use ($driver) {
            return $item == $driver['id'];
        });

        $rejected_bidders = User::whereIn('id', $rejected_bidders_ids)->get();

        foreach($rejected_bidders as $bidder) {

            Event::forceCreate([
                "user_id" => $bidder['id'],
                "name" => "Bid rejected",
                "description" => "Job: #" . $job->id . ' from ' . $job['pickup_point'] . ' to ' . $job['destination_point'],
                "status" => "new",
                "type" => "feedback"
            ]);

            Mail::queue('emails.bids.rejected-bid', [
                'user' => $bidder,
                'job' => $job
            ], function($message) use($bidder, $job) {

                $message->to($bidder['email'], $bidder['name_full'])
                    ->subject('SDCN - Your Bid was not accepted on Job #' . $job['id'] . ' from ' . $job['pickup_point'] . ' to ' . $job['destination_point']);
            });
        }

	}

}
