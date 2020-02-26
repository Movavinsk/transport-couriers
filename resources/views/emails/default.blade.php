<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="utf-8">
</head>
<body>
<div style="background-color: #f1f3f4; text-align: center;">
    <div style="max-width: 100%; width: 800px; padding: 40px 15px; margin-left: auto; margin-right: auto; display: inline-block; text-align: left;">
        <div style="padding: 20px 40px; background-color: #013E61; border-top-left-radius: 4px; border-top-right-radius: 4px; text-align: center;">
            <img src="{{ asset('assets/img/sdcn-logo.png ') }}" alt="Sameday Courier Network"/>
        </div>
        <div style="padding: 40px; background-color: #fff; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;">
            <div class="">
                @yield('content')
            </div>
            <br/>
            <div>
                <p>For any queries or feedback (which we strongly encourage),
                    please call 01202 511 559 or email <a href="mailto:info@samedaycouriernetwork.com">info@samedaycouriernetwork.com</a></p>
                <p>We look forward to you growing your business on the SDCN platform.</p>
                <p>The SDCN team</p>
            </div>
        </div>
    </div>
</div>
</body>
</html>




