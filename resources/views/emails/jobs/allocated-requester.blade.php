@extends('emails.default')
@section('content')
    <p>Hi {{$requester["name_first"]}},</p>
    <br/>
    <p>You have successfully allocated job #{{$job['id']}} to {{$driver["name_full"]}}!</p>
    <br/>
    <p>To post another job, please visit your <a href="{{URL('/')}}/browse/jobs">dashboard</a>.</p>
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
        <li>Liaise directly with your driver to arrange the pickup and delivery of the load.</li>
        <li>Once delivered you should receive a POD and invoice from the driver.</li>
        <li>Leave feedback for the driver.</li>
    </ul>
    <p>That’s it!</p>
@endsection