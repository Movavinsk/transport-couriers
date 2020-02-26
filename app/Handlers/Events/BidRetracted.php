<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Sdcn\Models\Bid;
use Sdcn\Models\Event;

class BidRetracted implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  Bid  $bid
	 * @return void
	 */
    public function handle(Bid $bid)
    {

        Event::forceCreate(array(
            "user_id" => $bid->user_id,
            "name" => "Bid retracted",
            "description" => "Job: #" . $bid->job_id . " - Bid successfully retracted",
            "status" => "new",
            "type" => "critical"
        ));

	}

}
