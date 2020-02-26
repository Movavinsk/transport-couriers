<?php

return [

	/*
	|--------------------------------------------------------------------------
	| Third Party Services
	|--------------------------------------------------------------------------
	|
	| This file is for storing the credentials for third party services such
	| as Stripe, Mailgun, Mandrill, and others. This file provides a sane
	| default location for this type of information, allowing packages
	| to have a conventional place to find your various credentials.
	|
	*/

	'mailgun' => [
		'domain' => env('MAIL_MAILGUN_DOMAIN', ''),
		'secret' => env('MAIL_MAILGUN_SECRET', ''),
	],

	'mandrill' => [
		'secret' => env('MAIL_MANDRILL_SECRET', ''),
	],

	'ses' => [
		'key' => '',
		'secret' => '',
		'region' => 'us-east-1',
	],

	'stripe' => [
		'model'  => 'User',
		'secret' => '',
	],

    'google_maps' => [
        'api_key' => env('GOOGLE_MAPS_API_KEY'),
        'geocode_base' => 'https://maps.googleapis.com/maps/api/geocode/',
    ],

];
