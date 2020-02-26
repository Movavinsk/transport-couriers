@extends('emails.default')
@section('content')
    <p>Hi {{$requester['name_first']}},</p>
    <br/>
    <p><strong>You’ve received a bid on Job #{{$job['id']}}.</strong></p>
    <p>To review your bids, please visit your <a href="{{URL('/')}}/user/my/jobs">dashboard</a>.</p>
    <br/>
    <p><strong>Driver details:</strong></p>
    <p><strong>Driver:</strong> {{$driver['name_full']}}</p>
    <p><strong>Driver's Phone Number:</strong> <a href="tel:{{$driver['phone']}}">{{$driver['phone']}}</a></p>
    <p><strong>Driver's company:</strong> {{$driver['team_info']['company_name']}}</p>
    <p><strong>Bid Amount:</strong> £{{$bid['amount']}}</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>Review your bids</li>
        <li>Once you have selected a driver, simply accept their bid through your
            <a href="{{URL('/')}}/user/my/jobs">dashboard</a></li>
        <li>Alternatively, allocate the job manually using the driver’s SDCN ID number or email address</li>
    </ul>
    <p>That’s it!</p>
@endsection
