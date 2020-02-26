@extends('emails.default')
@section('content')
    <p>Hi {{$user["name_first"]}},</p>
    <br/>
    <p>Your account has now been approved by the SDCN administrators, and you can bid on jobs!</p>
    <br/>
    <p><b>What are the next steps?</b></p>
    <br/>
    <ul>
        <li>
            If you’re logged in to SDCN, then please log out and back in again to activate your account.
        </li>
        <li>
            Otherwise, click here to <a href="{{URL('/')}}/user/jobs/browse">Find your next job!</a>
        </li>
    </ul>
    <br/>
@endsection