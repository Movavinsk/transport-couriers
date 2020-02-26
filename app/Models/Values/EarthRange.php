<?php

namespace Sdcn\Models\Values;


class EarthRange
{

    /**
     * @var EarthPoint
     */
    public $point;

    /**
     * @var int
     */
    public $distance;

    public function __construct(EarthPoint $point, $distance)
    {
        $this->point = $point;
        $this->distance = $distance;
    }
}