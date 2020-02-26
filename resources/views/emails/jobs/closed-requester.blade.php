@extends('emails.default')
@section('content')
    <p>Hi {{$requester['name_first']}},</p>
    <br/>
    <p>Congratulations, job #{{$job['id']}} is now complete.</p>
    <br/>
    <p><strong>Driver details:</strong></p>
    <p><strong>Driver:</strong> {{$driver['name_full']}}</p>
    <p><strong>Company:</strong> {{$driver['team_info']['company_name']}}</p>
    <p>Bid Amount: £{{$job['bid']['amount']}} @if ($job['bid']["add_vat"] == 1) + VAT @endif</p>
    <br/>
    <p><strong>The details of the job for your records:</strong></p>
    <p><strong>Job ID:</strong> #{{$job['id']}}</p>
    <p><strong>Pickup:</strong> {{$job->getPickupAndTime(true)}}</p>
    <p><strong>Destination:</strong> {{$job->getDestinationAndTime(true)}}</p>
    <br/>
    <p><strong>What are the next steps?</strong></p>
    <ul>
        <li>If you’ve not already done so, please leave feedback for {{$driver['name_full']}} by logging in
            <a href="{{URL('/')}}/">dashboard</a>.</li>
        <li>Once delivered, upload your Proof of Delivery and raise your invoice through your
            <a href="{{URL('/')}}/user/my/jobs">dashboard</a></li>
        <li>Post your next job!</li>
    </ul>
    <p>That’s it!</p>
@endsection

