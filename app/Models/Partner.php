<?php

namespace Sdcn\Models;

use Sdcn\Models\User;
use Sdcn\Models\Benefit;
use Illuminate\Database\Eloquent\Builder;

class Partner extends AbstractModel
{
    protected $fillable = [
        'name',
        'logo',
        'description',
    ];

    protected $appends = ['benefits_count'];

    protected $with = ['benefits'];

    public function benefits()
    {
        return $this->hasMany(Benefit::class);
    }

    public function getBenefitsCountAttribute()
    {
        $result = \DB::table('partners')
            // ->select('partners.*')
            ->join('benefits', 'benefits.partner_id', '=', 'partners.id')
            ->where('partners.id', $this->id)
            ->where('benefits.active', 1)
            ->get();

        return count($result);
    }

}