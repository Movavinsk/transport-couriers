<?php namespace Sdcn\Services\Acl;

use Doctrine\Common\Annotations\AnnotationReader;
use Doctrine\Common\Annotations\AnnotationRegistry;
use Doctrine\Common\Annotations\FileCacheReader;
use Illuminate\Contracts\Validation\UnauthorizedException;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Routing\Router;
use Sdcn\Services\Acl\Annotations\Ace;

class ConstraintsParser
{

    /**
     * @var Router
     */
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function boot()
    {
        $this->router->matched([$this, 'filter']);
    }

    public function filter(RouteMatched $matched)
    {
        $route = $matched->route;

        $reader = new FileCacheReader(
            new AnnotationReader,
            storage_path('app/acl'),
            $debug = config('app.debug')
        );

        AnnotationRegistry::registerFile(__DIR__.'/Annotations/Ace.php');

        $aclTable = app(Constraints::class);
        $aclTableRefl = new \ReflectionClass(get_class($aclTable));
        foreach ($aclTableRefl->getMethods() as $method) {
            $annotations = $reader->getMethodAnnotations($method);
            foreach ($annotations as $annotation) {
                /** @var Ace $annotation */
                if ($annotation->isApplicable($route)) {
                    // The constraints are added based on the user abilities.
                    // A guest visitor shouldn't be allowed by default to arrive
                    // on one of these routes because it causes fatal errors.
                    $this->assureLogged();

                    if (!$method->invoke($aclTable)) {
                        $this->sendUnauthorized();
                    }
                }
            }
        }
    }

    public function assureLogged()
    {
        if (\Auth::guest()) {
            $response = redirect()->to('login');
            $response->send();
            exit;
        }
    }

    public function sendUnauthorized()
    {
        $response = new Response("You're not authorized to access this resource.", 401);
        $response->send();
        exit;
    }
}
