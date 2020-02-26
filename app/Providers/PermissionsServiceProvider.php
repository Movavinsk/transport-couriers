<?php namespace Sdcn\Providers;

use Illuminate\Support\ServiceProvider;
use Sdcn\Services\Acl\Constraints;
use Sdcn\Services\Acl\ConstraintsParser;
use Sdcn\Services\Acl\Definition;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Role\GenericRole as Role;
use Zend\Permissions\Acl\Resource\GenericResource as Resource;

class PermissionsServiceProvider extends ServiceProvider {

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('acl', function() {
            $acl = new Acl();

            $definition = new Definition();
            $definition->apply($acl);

            return $acl;
        });

        $this->app->singleton('acl.parser', function() {
            return $this->app->make(ConstraintsParser::class);
        });
    }

    public function boot()
    {
        $this->app['acl.parser']->boot();
    }
}