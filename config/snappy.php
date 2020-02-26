<?php

return array(


    'pdf' => array(
        'enabled' => true,
        'binary' => env('WKHTMLTOPDF', '/usr/local/bin/wkhtmltopdf'),
        'timeout' => false,
        'options' => array(),
    ),
    'image' => array(
        'enabled' => false,
        'binary' => '/usr/local/bin/wkhtmltoimage',
        'timeout' => false,
        'options' => array(),
    ),


);
