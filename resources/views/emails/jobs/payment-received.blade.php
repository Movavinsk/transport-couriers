@extends('emails.default')
@section('content')
    <p>Hi {{$job["user_info"]["name_first"]}},</p>
    <br/>
    <p>Your payment for invoice {{$invoice["invoice_number"]}} on job #{{$job["id"]}} has been marked as received.</p>
    <br/>
    <p><strong>The details of the job:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Job Cost:</strong> £{{$invoice['sub_total']}} @if ($invoice["add_vat"] == 1) + VAT @endif</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Leave feedback for the driver</li>
        <li>For any disputes, we encourage you to discuss directly with the driver</li>
    </ul>
    <p>That’s it!</p>
@endsection