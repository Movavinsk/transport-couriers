<?php namespace Sdcn\Http\Controllers;

use Illuminate\Support\Facades\Response;

/**
 * Class AppController
 * Controls all non-API routes
 * @package Sdcn\Http\Controllers
 */
class AppController extends AbstractController {

	/**
	 * Route that loads to angular application through app.html
	 */
	public function angularApp()
	{
		return Response::make(file_get_contents( public_path('app.html') ));
	}

	/**
	 * Static route to .html files
	 * Return home.html if path is empty
	 * @param $path
	 * @return mixed
	 */
	public function staticHtml($path)
	{
		// If html file exists return its content
		if( file_exists( public_path($path . '.html') ) )
		{
			return Response::make(file_get_contents( public_path($path . '.html') ));
		}
		elseif($path == '/')
		{
			return Response::make(file_get_contents( public_path('home.html') ));
		}
		elseif( file_exists( public_path('index.html') ) )
		{
			return $this
				->statusInternalError()
				->messages('AppController', 'Rename index.html to home.html')
				->respond();
		}
		return $this
			->statusNotFound()
			->messages('AppController', 'Action could not be completed due to missing route: ' . $path)
			->respond();
	}

	/**
	 * Fail all api requests
	 * This route handles api requests at a very late stage and returns a failure
	 * @param $path
	 * @return Response
	 */
	public function notFound($path)
	{
		return $this
			->statusNotFound()
			->messages('AppController', 'Action could not be completed due to missing route: ' . $path)
			->respond();
	}
}
