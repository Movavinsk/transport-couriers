@extends('emails.default')
@section('content')
    <p>Hi {{$job["user_info"]["name_first"]}},</p>
    <br/>
    <p>Your job has been successfully added!</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>You should start to receive bids very soon from drivers - we’ll notify you when they arrive.</li>
        <li>Simply review them, and accept the driver who is the best fit for your task!</li>
    </ul>
    <p>That’s it!</p>
@endsection
