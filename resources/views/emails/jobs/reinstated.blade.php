@extends('emails.default')
@section('content')
    <p>Hi {{$job["user_info"]["name_first"]}},</p>
    <br/>
    <p>Job #{{$job["id"]}} had expired, but has been reinstated.</p>
    <br/>
    <p>Your previous bid is still active. Please log in to your <a href="{{URL('/')}}/browse/jobs">dashboard</a> to manage your bid for this job.</p>
    <br/>
    <p><strong>The details of the job:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
@endsection