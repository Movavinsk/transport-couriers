@extends('emails.default')
@section('content')
    <p>Hi,</p>
    <p>A Document for your team member {{ $user->name_full }} has been approved.</p>
    <p>To login, please visit: <a href="{{URL('/')}}/login">{{URL('/')}}/login</a></p>
@endsection