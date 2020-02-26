<?php namespace Sdcn\Models;

class Pod extends AbstractModel
{
	protected $fillable = [
		'job_id',
		'recipient',
		'delivery_date',
		'upload',
        'no_pod_reason'
	];

}