@extends('emails.default')
@section('content')
    <p>Hi {{$driver['name_first']}},</p>
    <br/>
    <p>You have been allocated job #{{$job['id']}} by {{$requester["team_info"]["company_name"]}}.</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Liaise directly with the job poster to arrange the pickup and delivery of the load.</li>
        <li>
            Once delivered you should upload a POD via your <a href="{{URL('/')}}/user/my/work">dashboard</a>,
            or send manually to {{$requester["team_info"]["company_name"]}}.
        </li>
        <li>After uploading the POD, you can an invoice in your <a href="{{URL('/')}}/user/my/work">dashboard</a>.</li>
        <li>Leave feedback for your client</li>
    </ul>
    <p>That’s it!</p>
@endsection