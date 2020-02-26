<?php

namespace Sdcn\Models\Values;


class EarthPoint
{

    /**
     * @var double
     */
    public $latitude;

    /**
     * @var double
     */
    public $longitude;

    public function __construct($latitude, $longitude)
    {
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }
}