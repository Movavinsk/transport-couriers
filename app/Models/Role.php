<?php namespace Sdcn\Models;

use Zizaco\Entrust\EntrustRole;
use Zizaco\Entrust\Traits\EntrustRoleTrait;
use Illuminate\Database\Eloquent\Builder;

class Role extends AbstractModel
{
    use EntrustRoleTrait;

    public function scopeByName(Builder $query, $name)
    {
        return $query->where('name', '=', $name);
    }
}
