<?php namespace Sdcn\Models;

class Setting extends AbstractModel
{
	protected $primaryKey = 'key';

	public $incrementing = false;

	protected $fillable = [
		'key',
		'value',
	];

}