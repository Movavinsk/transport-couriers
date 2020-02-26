@extends('emails.default')
@section('content')
    <p>Hi,</p>
    <p>Team {{ $document->user->team->company_name }} has uploaded a document that requires your approval.</p>
    <p>To login, please visit: <a href="{{URL('/')}}/login">{{URL('/')}}/login</a></p>
@endsection