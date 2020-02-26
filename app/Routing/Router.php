<?php namespace Sdcn\Routing;

use Illuminate\Routing\Router as IlluminateRouter;

class Router extends IlluminateRouter {

	// Override to force use of Sdcn\Routing\ResourceRegistrar
	public function resource($name, $controller, array $options = array())
	{
		(new ResourceRegistrar($this))->register($name, $controller, $options);
	}
}
