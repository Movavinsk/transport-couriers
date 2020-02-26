<?php namespace Sdcn\Services\Acl\Annotations;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;

/**
 * @Annotation
 * @Target({"METHOD"})
 */
class Ace {

    protected $name;

    public function __construct(array $values)
    {
        $this->name = $values['route'];
    }

    public function isApplicable(Route $route)
    {
        if($this->name && $route->getName() == $this->name) {
            return true;
        }
    }
}