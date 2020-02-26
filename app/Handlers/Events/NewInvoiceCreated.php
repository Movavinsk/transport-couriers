<?php namespace Sdcn\Handlers\Events;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Sdcn\Models\Event;
use Sdcn\Models\Invoice;
use Sdcn\Models\Job;

class NewInvoiceCreated
{

    /**
     * Handle the event.
     *
     * @param  Invoice $invoice
     * @return void
     */
    public function handle(Invoice $invoice)
    {
        /** @var Job $job */
        $job = Job::find($invoice->job_id);

        $driver = $job['bid']['user'];

        Event::forceCreate(
            [
                "user_id"     => $job->user_id,
                "name"        => "Invoice received",
                "description" => "Invoice received for Job: #".$job->id,
                "status"      => "new",
                "type"        => "trivial"
            ]
        );

        Event::forceCreate(
            [
                "user_id"     => $job->bid_user_id,
                "name"        => "Invoice sent",
                "description" => "Invoice sent successfully for Job: #".$job->id,
                "status"      => "new",
                "type"        => "feedback"
            ]
        );

        $recipient = $job->user->team->invoice_recipient;

        Mail::send(
            'emails.jobs.invoice',
            compact('recipient', 'driver', 'job', 'invoice'),
            function ($message) use ($recipient, $job, $invoice) {
                $message
                    ->to($recipient->getEmail(), $recipient->getName())
                    ->subject('SDCN - Invoice Received for Job #'.$job->id)
                    ->attachData(\SPDF::loadView('pdfs.invoice', $invoice->toArray())->output(), $invoice->invoice_number . '.pdf' ,array('as' => $invoice->invoice_number . '.pdf', 'mime' => 'application/pdf'));

                if ($invoice->cc) {
                    $message->cc($invoice->cc);
                }
            }
        );

        $recipient_driver = Auth::user()->team->invoice_recipient;

        Mail::send(
            'emails.jobs.invoice-driver',
            compact('recipient_driver', 'driver', 'job', 'invoice'),
            function ($message) use ($recipient_driver, $job, $invoice) {
                $message
                    ->to($recipient_driver->getEmail(), $recipient_driver->getName())
                    ->subject('SDCN - Invoice Sent for Job #'.$job->id)
                    ->attachData(\SPDF::loadView('pdfs.invoice', $invoice->toArray())->output(), $invoice->invoice_number . '.pdf' ,array('as' => $invoice->invoice_number . '.pdf', 'mime' => 'application/pdf'));
            }
        );
    }

}
