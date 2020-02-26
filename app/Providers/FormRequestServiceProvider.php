<?php namespace Sdcn\Providers;

use Illuminate\Contracts\Container\BindingResolutionException;
use Illuminate\Support\ServiceProvider;

class FormRequestServiceProvider extends ServiceProvider
{
	public function register()
	{
		$this->app->singleton('Sdcn\Http\Requests\AbstractFormRequest', function ($app) {

			$routeParts = explode('@', $app['router']->currentRouteAction());
			$routeAction = end($routeParts);

			$classParts = explode('\\', reset($routeParts));
			$className = end($classParts);
			$modelName = str_replace('Controller', '', $className);

			if( $routeAction == 'store' )
			{
				return $app->make('Sdcn\Http\Requests\\' . $modelName . '\\CreateRequest');
			}
			elseif( $routeAction == 'update' )
			{
				return $app->make('Sdcn\Http\Requests\\' . $modelName . '\\UpdateRequest');
			}
			throw new BindingResolutionException("Cannot instantiate form request for controller action: {$routeAction}");
		});
	}
}
