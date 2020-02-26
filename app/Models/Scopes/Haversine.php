<?php namespace Sdcn\Models\Scopes;



use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class Haversine
{

    /**
     * @var array
     */
    protected $circle_radius = [
        'miles' => 3959
    ];

    /**
     * @var string
     */
    private $latitude_column;

    /**
     * @var string
     */
    private $longitude_column;

    public function __construct($latitude_column, $longitude_column)
    {
        $this->latitude_column = $latitude_column;
        $this->longitude_column = $longitude_column;
    }

    public function applyDistanceConstraints(Builder $query, $lat, $lng, $maximum_distance, $boolean = 'and')
    {
        $query->orderBy($this->getDbDistanceStatement($lat, $lng), 'ASC');
        $query->where($this->getDbDistanceStatement($lat, $lng), '<=', $maximum_distance, $boolean);
    }

    public function getDbDistanceStatement($lat, $lng)
    {
        return DB::raw($this->getDistanceStatement($lat, $lng));
    }

    public function getDistanceStatement($lat, $lng)
    {
        $lat = floatval($lat);
        $lng = floatval($lng);

        return <<<SELECT
            ROUND (
              (
                {$this->circle_radius['miles']}
                *
                acos (
                  cos(radians($lat)) * cos(radians($this->latitude_column))
				  * cos(radians($this->longitude_column) - radians($lng))
				  + sin(radians($lat)) * sin(radians($this->latitude_column))
				)
			  )
        	, 2)
SELECT;
    }
}