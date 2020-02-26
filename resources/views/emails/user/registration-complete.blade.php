@extends('emails.default-admin')
@section('content')
    <p>Hi Admin,</p>
    <p>A new user has completed their registration to SDCN.</p>
    <p>Name: {{ $user->name_first }} {{ $user->name_last }}</p>
    <p>Email: {{ $user->email }}</p>
    <p>Company: {{ $user->team->company_name }}</p>
    <p>To review and activate the user's account, please visit the <a href="{{URL('/')}}/admin/teams/edit/{{ $user->team->id }}">admin area.</a></p>
@endsection