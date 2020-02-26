@extends('emails.default')

@section('content')
    <p>Hi {{ $recipient_driver->getName() }},</p>
    <br/>
    <p>Your invoice has been sent for Job #{{$job["id"]}}.</p>
    <br/>
    <p><strong>The details of the job:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Job Cost:</strong> £{{$invoice['sub_total']}} @if ($invoice["add_vat"] == 1) + VAT @endif</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p>Please note, the agreed project cost might vary from the above figure if additional items were added (such as waiting times or toll roads costs).</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Leave feedback for the client</li>
        <li>For any disputes, we encourage you to discuss directly with the client</li>
    </ul>
    <p>That’s it!</p>
@endsection