@extends('emails.default')
@section('content')
    <p>Hi {{$user['name_first']}},</p>
    <p>Your account on SDCN has been created - welcome!</p>
    <p>To login, please visit: <a href="{{URL('/')}}/login">{{URL('/')}}/login</a></p>
    <p>Please use your registered email address. You’ll be prompted to set a password upon first login.</p>
@endsection