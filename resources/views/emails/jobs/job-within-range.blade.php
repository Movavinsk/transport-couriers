@extends('emails.default')
@section('content')
    <p>Hi {{$user["name_first"]}},</p>
    <br/>
    <p>A new job has been added near you.</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime()}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime()}}</p>
    <p><strong>Estimated Distance:</strong> {{ $job['distance_in_miles']  }}mi</p>
    <p><strong>Vehicle size:</strong> {{$job['vehicle']['name']}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Bid on this job now by clicking <a href="{!! secure_url('/user/jobs/browse') !!}">here</a></li>
    </ul>
    <p>That’s it!</p>
@endsection
