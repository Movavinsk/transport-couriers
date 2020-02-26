@extends('emails.default')
@section('content')
    <p>Hi {{$user["name_first"]}},</p>
    <br/>
    <p>Your account has now been assigned as the Primary User for {{$user["team_info"]["company_name"]}}.</p>
    <br/>
    <p><b>What are the next steps?</b></p>
    <br/>
    <ul>
        <li>
            You can now reset passwords for the users in {{$user["team_info"]["company_name"]}} by visiting <a href="{{URL('/')}}/user/my/users">My Users</a>.
        </li>
        <li>
            You can also add and deactivate users in your company, and also specify the default invoice recipient (which will be you, unless otherwise defined).
        </li>
    </ul>
    <br/>
@endsection