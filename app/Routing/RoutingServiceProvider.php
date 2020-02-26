<?php namespace Sdcn\Routing;

use Illuminate\Routing\RoutingServiceProvider as IlluminateRoutingServiceProvider;

class RoutingServiceProvider extends IlluminateRoutingServiceProvider {

	protected function registerRouter()
	{
		$this->app['router'] = $this->app->share(function($app)
		{
			return new Router($app['events'], $app);
		});
	}
}
