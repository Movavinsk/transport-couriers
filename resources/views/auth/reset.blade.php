@extends('app')

@section('content')
    <div class="app-reset-password">
        <div class="container">
            <div class="row m-t-lg">
                <div class="register-form">
                    <div class="panel panel-default">
                        <div class="panel-body">
                            <h2>Create a password</h2>
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    <strong>Whoops!</strong> There were some problems with your input.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            <form class="form-horizontal" role="form" method="POST" autocomplete="off" action="{{ route('confirm.reset') }}">
                                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                                <input type="hidden" name="token" value="{{ $token }}">
                                <label>
                                    <img src="{{ asset('images/icons8-message.png') }}" class="email" alt="icon-email">
                                    <input type="email" class="form-control" name="email" placeholder="Email Address" value="{{ old('email') }}"  autocomplete="off" >
                                </label>
                                <label>
                                    <img src="{{ asset('images/icons8-lock_2.png') }}" alt="icon-lock">
                                    <input type="password" class="form-control" name="password" placeholder="Create a password" autocomplete="off">
                                </label>
                                <label>
                                    <img src="{{ asset('images/icons8-lock_2.png') }}" alt="icon-lock">
                                    <input type="password" class="form-control" name="password_confirmation" placeholder="Confirm password">
                                </label>
                                <button type="submit" class="btn btn-lg btn-info btn-block">
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
