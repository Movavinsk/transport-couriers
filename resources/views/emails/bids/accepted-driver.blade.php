@extends('emails.default')
@section('content')
    <p>Hi {{$driver['name_first']}},</p>
    <br/>
    <p>Your bid was successful.</p>
    <p>To review your job, please visit your <a href="{{URL('/')}}/user/my/work">dashboard</a>.</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Liaise directly with your client to arrange the pickup and delivery of the load.</li>
        <li>Once delivered, upload your Proof of Delivery and raise your invoice through your
            <a href="{{URL('/')}}/user/my/work">dashboard</a></li>
        <li>Leave feedback for your client</li>
    </ul>
    <p>That’s it!</p>
@endsection