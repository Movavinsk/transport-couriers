<?php namespace Sdcn;

use Dotenv\Dotenv;
use Illuminate\Events\EventServiceProvider;
use Sdcn\Routing\RoutingServiceProvider;

/**
 * Class Application
 * Extend default Laravel application to override publicPath function
 */
class Application extends \Illuminate\Foundation\Application
{
	public function publicPath()
	{
		$path = env('APP_PUBLIC_PATH');

		// It may be too early to use env values so we force load `.env` values
		if( is_null($path) )
		{
			try
			{
				$dotenv = new Dotenv($this->basePath, $this->environmentFile);
				$dotenv->load();
			}
			catch (\InvalidArgumentException $e) {

			}
		}

		$path = env('APP_PUBLIC_PATH', 'public');

		return $this->basePath . '/' . $path;
	}

	protected function registerBaseServiceProviders()
	{
		$this->register(new EventServiceProvider($this));

		$this->register(new RoutingServiceProvider($this));
	}

}
