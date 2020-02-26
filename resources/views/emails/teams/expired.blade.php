@extends('emails.default')
@section('content')
    <p>Hi {{$primary["name_first"]}},</p>
    <br/>
    <p>{{$team["company_name"]}}’s membership has now expired.</p>
    <br/>
@endsection