<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Bid;
use Sdcn\Models\Event;
use Sdcn\Models\Job;

class NewBidAdded {

	/**
	 * Handle the event.
	 *
	 * @param  Bid  $bid
	 * @return void
	 */
	public function handle(Bid $bid)
	{
        $job = Job::find($bid->job_id);

        $requester = $job->user_info;

        $driver = $bid->user;

        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Bid received",
            "description" => "Job: #" . $job->id . ", Amount: £" . $bid->amount,
            "status" => "new",
            "type" => "trivial"
        ));

        Event::forceCreate(array(
            "user_id" => $bid->user_id,
            "name" => "Bid sent",
            "description" => "Job: #" . $job->id . ", Amount: £" . $bid->amount,
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.bids.new-bid', [
            'requester'=>$requester,
            'driver'=>$driver,
            'job'=>$job,
            'bid'=>$bid
        ], function($message) use ($requester, $driver, $bid)
        {
            $message->to($requester['email'], $requester['name_full'])->subject('SDCN - New Bid on Job #' . $bid['job_id'] . ' Received');
        });
	}

}
