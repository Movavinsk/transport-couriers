<?php namespace Sdcn\Routing;

use Illuminate\Routing\ResourceRegistrar as IlluminateResourceRegistrar;

class ResourceRegistrar extends IlluminateResourceRegistrar {

	//Add new resource routes - select, export
	protected $resourceDefaults = array('index', 'create', 'select', 'store', 'show', 'edit', 'update', 'destroy');

	// GET, /customers/select - send key/value list
	protected function addResourceSelect($name, $base, $controller, $options)
	{
		$uri = $this->getResourceUri($name).'/select';

		$action = $this->getResourceAction($name, $controller, 'select', $options);

		return $this->router->get($uri, $action);
	}

}
