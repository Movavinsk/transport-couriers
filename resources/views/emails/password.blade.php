@extends('emails.default')
@section('content')
    <h3>Activate your account</h3>
    <div>
        To activate your account, please click here: <a href="{{ url('login/reset/'.$token) }}">{{ url('login/reset/'.$token) }}</a>
    </div>
@endsection