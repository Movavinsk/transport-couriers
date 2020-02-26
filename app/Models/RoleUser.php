<?php namespace Sdcn\Models;

class RoleUser extends AbstractModel {

    protected $table = 'role_user';

    public function role()
    {
        return $this->belongsTo('Sdcn\Models\Role');
    }

    public function user()
    {
        return $this->belongsTo('Sdcn\Models\User');
    }
}