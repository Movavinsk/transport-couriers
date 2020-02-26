@extends('emails.default')
@section('content')
    <p>Hi {{$driver['name_first']}},</p>
    <br/>
    <p>Congratulations, job #{{$job['id']}} is now complete.</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Liaise directly with your client to arrange the pickup and delivery of the load.</li>
        <li>If you’ve not already done so, please leave feedback for {{$requester['name_full']}} by logging in
            <a href="{{URL('/')}}/user/my/work">dashboard</a>.</li>
        <li><a href="{{URL('/')}}/user/jobs/browse">Find your next job!</a></li>
    </ul>
    <p>That’s it!</p>
@endsection