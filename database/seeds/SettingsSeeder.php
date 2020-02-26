<?php

use Sdcn\Models\Setting;

class SettingsSeeder extends AbstractArraySeeder
{
	protected $items = [
        [   'key' => 'mail_driver',
            'value' => 'mandrill'
        ],
		[   'key' => 'mail_from_name',
			'value' => 'SDCN'
		],
		[   'key' => 'mail_from_email',
			'value' => 'info@samedaycouriernetwork.com'
		],
		[   'key' => 'mail_smtp_host',
			'value' => 'smtp.mandrillapp.com'
		],
		[   'key' => 'mail_smtp_port',
			'value' => '587'
		],
		[   'key' => 'mail_smtp_username',
			'value' => 'info@samedaycouriernetwork.com'
		],
		[   'key' => 'mail_smtp_password',
			'value' => 'eVLcVxsRRLZKIgsXEO4kuA'
		],
		[   'key' => 'mail_smtp_encryption',
			'value' => 'tls'
		],
		[   'key' => 'mail_smtp_pretend',
			'value' => '0'
		],
		[   'key' => 'mail_admin_email',
			'value' => 'doug@bourne-it-services.co.uk'
		],
	];

	public function __construct(Setting $model)
	{
		$this->model = $model;
	}
}
