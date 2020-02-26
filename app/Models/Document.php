<?php

namespace Sdcn\Models;

use Carbon\Carbon;
use Sdcn\Models\Team;
use Sdcn\Models\User;
use Sdcn\Models\DocumentType;

class Document extends AbstractModel
{
    const GOODS_IN_TRANSIT_TYPE_ID = 1;
    const FLEET_OR_VEHICLE_INSURANCE_TYPE_ID = 2;
    const PUBLIC_LIABILITY_TYPE_ID = 4;
    const DRIVING_LICENCE_TYPE_ID = 5;
    const POSTING_ONLY_TYPE_ID = 6;
    const OTHER_TYPE_ID = 7;
    const INSURANCE_POLICY_STATEMENT_TYPE_ID = 8;
    const ADR_CERTIFICATE_TYPE_ID = 9;

    protected $fillable = [
        'user_id',
        'team_id',
        'type_id',
        'status',
        'expiry',
        'upload',
        'miles',
        'insured_amount'
    ];

    protected $dates = [
        'expiry'
    ];

    protected $with = ['type'];

    public function type()
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Document owner
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     *    Team
     */
    public function team()
    {
        return $this->user->team();
    }

    public function setExpiryAttribute($value)
    {
        $this->attributes['expiry'] = Carbon::parse($value);
    }


}
