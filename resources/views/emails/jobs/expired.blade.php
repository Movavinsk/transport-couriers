@extends('emails.default')
@section('content')
    <p>Hi {{$job["user_info"]["name_first"]}},</p>
    <br/>
    <p>Job #{{$job["id"]}} expired without it being allocated to a driver.</p>
    <br/>
    <p>To post another job, please visit your <a href="{{URL('/')}}/browse/jobs">dashboard</a>.</p>
    <br/>
    <p><strong>The details of the job:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
@endsection