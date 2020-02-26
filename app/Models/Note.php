<?php

namespace Sdcn\Models;

use Sdcn\Models\AbstractModel;

class Note extends AbstractModel
{
    protected $fillable = [
        'user_id',
        'team_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
