@extends('emails.default')
@section('content')
    <p>Hi {{$requester['name_first']}},</p>
    <br/>
    <p>To review the Proof of Delivery for this job, please visit your <a href="{{URL('/')}}/user/my/jobs">dashboard</a>.</p>
    <br/>
    <p><strong>Driver details:</strong></p>
    <p><strong>Driver:</strong> {{$driver['name_full']}}</p>
    <p><strong>Company:</strong> {{$driver['team_info']['company_name']}}</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>You will receive an invoice shortly for your records</li>
        <li>Leave feedback for the driver</li>
    </ul>
    <p>That’s it!</p>
@endsection
