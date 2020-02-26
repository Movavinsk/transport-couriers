@extends('emails.default')

@section('content')
    <p>Hi {{ $recipient->getName() }},</p>
    <br/>
    <p>An invoice has been received for Job #{{$job["id"]}}.</p>
    <p>To review the invoice for this job, please visit your <a href="{{URL('/')}}/user/my/jobs">dashboard</a>.</p>
    <br/>
    <p><strong>Driver details:</strong></p>
    <p><strong>Driver:</strong> {{$driver['name_full']}}</p>
    <p><strong>Company:</strong> {{$driver['team_info']['company_name']}}</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Job Cost:</strong> £{{$invoice['sub_total']}} @if ($invoice["add_vat"] == 1) + VAT @endif</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p>Please note, the agreed project cost might vary from the above figure if additional items were added (such as waiting times or toll roads costs).</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Pay the invoice through the agreed method</li>
        <li>Leave feedback for the driver</li>
        <li>For any disputes, we encourage you to discuss directly with the driver</li>
    </ul>
    <p>That’s it!</p>
@endsection