<?php

namespace Sdcn\Models;

use Illuminate\Database\Eloquent\Model;

class OauthClient extends Model
{
	protected $table = "oauth_clients";
	public $incrementing = false;
}
