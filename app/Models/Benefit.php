<?php

namespace Sdcn\Models;

use Sdcn\Models\User;
use Sdcn\Models\Partner;
use Illuminate\Database\Eloquent\Builder;

class Benefit extends AbstractModel
{
    protected $fillable = [
        'name',
        'logo',
        'description',
        'url',
        'active'
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

}