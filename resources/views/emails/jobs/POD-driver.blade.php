@extends('emails.default')
@section('content')
    <p>Hi {{$driver['name_first']}},</p>
    <br/>
    <p>To review the Proof of Delivery for this job, please visit your <a href="{{URL('/')}}/user/my/work">dashboard</a>.</p>
    <br/>
    <p><strong>The details of the job:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Raise your invoice through your <a href="{{URL('/')}}/user/my/work">dashboard</a></li>
        <li>Leave feedback for the client</li>
    </ul>
    <p>That’s it!</p>
@endsection
