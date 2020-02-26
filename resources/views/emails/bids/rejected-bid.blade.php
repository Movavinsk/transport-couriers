@extends('emails.default')
@section('content')
    <p>Hi {{$user['name_first']}},</p>
    <br/>
    <p>Unfortunately your bid wasn’t accepted on</p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime()}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime()}}</p>
    <p>To review your job, please visit your <a href="{{URL('/')}}/user/my/work">dashboard</a>.</p>
    <br/>
    <p>View available jobs on your <a href="{{URL('/')}}/user/my/work">dashboard</a> </p>
@endsection