<?php namespace Sdcn\Handlers\Events;

use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Job;
use Sdcn\Models\Event;
use Sdcn\Models\Invoice;

class JobPaymentReceived implements ShouldQueue {

	use InteractsWithQueue;

	/**
	 * Handle the event.
	 *
	 * @param  Job  $job
	 * @return void
	 */
	public function handle(Job $job)
	{
        $invoice = Invoice::where("job_id", "=", $job->id)->first();

        Event::forceCreate(array(
            "user_id" => $job->user_id,
            "name" => "Payment received",
            "description" => "Your payment has been received for invoice " . $invoice["invoice_number"],
            "status" => "new",
            "type" => "feedback"
        ));

        Mail::send('emails.jobs.payment-received', [
            'job' => $job,
            'invoice' => $invoice
        ], function ($message) use ($job, $invoice)
        {
            $message
                ->to($job->user_info['email'], $job->user_info['name_full'])
                ->subject('SDCN - Payment Received for Invoice ' . $invoice["invoice_number"]);
        });
	}

}
