<?php

namespace Sdcn\Models;

class SentJobNotification extends AbstractModel
{
    const FCM_NOTIFICATION = 1;
    const EMAIL_NOTIFICATION = 2;

    const TYPES = [
        self::FCM_NOTIFICATION   => 'fcm',
        self::EMAIL_NOTIFICATION => 'email',
    ];

    protected $fillable = [
        'user_id',
        'job_id',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTypeAttribute()
    {
        return self::TYPES[$this->attributes['type']];
    }
}
