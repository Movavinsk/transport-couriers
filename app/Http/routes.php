<?php

use LucaDegasperi\OAuth2Server\Facades\Authorizer;
use Sdcn\Models\Job;
use Sdcn\Routing\Router;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

/**
 * @var Router $router
 */

$router->group(
    ['prefix' => 'api', 'middleware' => 'bindings'], // remove prefix
    function ($router) {
        // Auth routes for login, logout, current, recover, reset actions
        $router->group(['prefix' => 'auth'], function ($router) {
            $router->group(['prefix' => 'user'], function ($router) {
                $router->delete('/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\UserController@delete');
                $router->get('current/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\UserController@getCurrent');
                $router->post('login/{one?}/{two?}/{three?}/{four?}/{five?}', ['uses' => 'Auth\UserController@postLogin', 'as' => 'user.login']);
                $router->get('logout/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\UserController@getLogout');
                $router->get('token/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\UserController@getToken');
                $router->get('with-related/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\UserController@getWithRelated');
                $router->any('{_missing}', 'Auth\UserController@missingMethod');
            });

            $router->group(['prefix' => 'password'], function ($router) {
                $router->delete('/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\PasswordController@delete');
                $router->post('recover/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\PasswordController@postRecover');
                $router->get('with-related/{one?}/{two?}/{three?}/{four?}/{five?}', 'Auth\PasswordController@getWithRelated');
                $router->get('reset/{token}',
                    [
                        'uses' => 'Auth\PasswordController@forgotPassword',
                        'as' => 'reset.password',
                    ]);
                $router->post('reset/{one?}/{two?}/{three?}/{four?}/{five?}',
                    [
                        'uses' => 'Auth\PasswordController@postReset',
                        'as' => 'confirm.reset',
                    ]);
                $router->any('{_missing}', 'Auth\PasswordController@missingMethod');
            });

            // Register new user route in auth
            $router->resource('users', 'UserController', ['only' => ['store']]);
        });

        $router->post('oauth/access_token', function () {
            return response()->json(Authorizer::issueAccessToken());
        });

        // Mobile api
        $router->group(['middleware' => ['oauth','api-login']], function ($router) {
            $router->post('location', 'User\UserController@updateLocation');
            $router->get('nearby', 'User\NotificationsController@nearby');
            $router->get('job/{job}', 'User\JobController@showJob');
            $router->post('fcm-token', 'User\UserController@updateFcmToken');
            $router->get('authenticate', 'User\UserController@authenticate');
            $router->get('me', 'User\UserController@me');
            $router->post('job/bids', 'User\BidController@store');
            $router->get('vehicle-list', 'ClientApi\VehiclesController@index');
        });

        // client api
        $router->group([
            'prefix' => 'client',
            'middleware' => ['oauth', 'client-api'],
        ], function ($router) {
            $router->post('job', 'ClientApi\JobController@store');
            $router->get('vehicles', 'ClientApi\VehiclesController@index');
        });

        $router->get('auth/guard', 'Auth\UserController@check');

        // Admin access routes for admin area only
        $router->group(['prefix' => 'admin', 'middleware' => 'admin'], function ($router) {
            $router->resource('users', 'UserController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);
            $router->resource('users.locations', 'Admin\LocationController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                ],
            ]);
            $router->resource('users.documents', 'Admin\DocumentController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                ],
            ]);
            $router->resource('users.feedback', 'Admin\FeedbackController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                ],
            ]);
            $router->resource('users.vehicles', 'Admin\VehiclesController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                ],
            ]);
            $router->resource('vehicles', 'VehicleController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);

            $router->resource('doctypes', 'Admin\DocumentTypeController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);

            $router->resource('teams', 'Admin\Team\TeamController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);
            $router->post('teams/{id}/logo', 'Admin\Team\TeamController@uploadLogo');
            $router->resource('teams.members', 'Admin\Team\MemberController', ['only' => ['update', 'show', 'index']]);
            $router->put('team/{team}/members/{user}/mark-as-primary', 'Admin\Team\MemberController@markAsPrimary');
            $router->resource('teams.documents', 'Admin\Team\MembersDocumentsController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                    'store',
                ],
            ]);
            $router->resource('teams.feedback', 'Admin\Team\MembersFeedbackController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                ],
            ]);
            $router->resource('teams.locations', 'Admin\Team\MembersLocationsController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                ],
            ]);
            $router->resource('teams.notes', 'Admin\Team\MembersNotesController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                ],
            ]);

            $router->resource('settings', 'Admin\SettingController', ['only' => ['show', 'store']]);

            $router->resource('feedbacks', 'Admin\FeedbackController', ['only' => ['index', 'destroy']]);
            $router->resource('jobs', 'Admin\JobController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);
            $router->resource('roles', 'Admin\RoleController', ['only' => ['index']]);
            $router->resource('bids', 'Admin\BidController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);
            $router->resource('pods', 'Admin\PodController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);
            $router->resource('invoices', 'Admin\InvoiceController', [
                'only' => [
                    'index',
                    'store',
                    'show',
                    'update',
                    'destroy',
                    'select',
                ],
            ]);

            $router->get('teamlist', 'Admin\Team\TeamController@teamlist', ['only' => ['index']]);
            $router->get('statistics/jobs', 'Admin\StatisticController@getJobsStatistic');
            $router->get('statistics/users', 'Admin\StatisticController@getUsersStatistic');
            $router->get('statistics/expiring', 'Admin\StatisticController@getExpiringMembersStatistic');
            $router->get('statistics/expiring_insurances', 'Admin\StatisticController@getExpiringInsurancesStatistic');

            $router->resource('partners', 'Admin\PartnersController');
            $router->post('partners/{partner}/logo', 'Admin\PartnersController@uploadLogo');
            $router->resource('partners.benefits', 'Admin\BenefitsController');
            $router->get('api-details/{user}', 'UserController@oAuthClientDetails');
        });

        //User access routes for user area only
        $router->group(['prefix' => 'user', 'middleware' => 'user'], function ($router) {
            $router->resource('feedbacks', 'User\FeedbackController', ['only' => 'index']);
            $router->put('profile/{user}', 'User\UserController@update');
            $router->get('jobs/browse', 'User\JobController@browse');
            $router->get('jobs/work', 'User\JobController@work');
            $router->resource('events', 'User\EventController', ['only' => ['index', 'update']]);
            $router->resource('jobs', 'User\JobController', ['only' => ['index', 'store', 'show', 'update']]);
            $router->post('jobs/{job}/feedback', 'User\FeedbackController@store');
            $router->resource('bids', 'User\BidController', ['only' => ['index', 'store', 'show']]);
            $router->resource('pods', 'User\PodController', ['only' => ['index', 'store', 'show']]);
            $router->resource('team/work', 'User\Team\Work\WorkController', ['only' => ['index']]);
            $router->resource('team', 'User\Team\TeamController', ['only' => ['show', 'update']]);
            $router->resource('team.members', 'User\Team\MemberController', [
                'only' => [
                    'show',
                    'index',
                    'update',
                    'store',
                ],
            ]);
            $router->put('team/{team}/members/{user}/mark-as-primary', 'User\Team\MemberController@markAsPrimary');
            $router->post('team/work/{job}/bid/{bid}/retract', 'User\Team\Work\BidController@retract');
            $router->resource('teams.documents', 'Admin\Team\MembersDocumentsController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                ],
            ]);
            $router->resource('teams.feedback', 'Admin\Team\MembersFeedbackController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                ],
            ]);
            $router->resource('teams.locations', 'Admin\Team\MembersLocationsController', [
                'only' => [
                    'update',
                    'show',
                    'index',
                    'destroy',
                ],
            ]);
            $router->resource('teams.jobs', 'User\Team\Job\JobController', ['only' => ['index']]);
            $router->resource('doctypes', 'User\DocumentTypeController', ['only' => ['index', 'show']]);
            $router->resource('invoices', 'User\InvoiceController', ['only' => ['index', 'store', 'show']]);
            $router->resource('user', 'User\UserController', ['only' => ['index']]);

            $router->resource('profile.events', 'User\EventController', [
                'only' => [
                    'index',
                    'show',
                    'store',
                    'destroy',
                    'update',
                ],
            ]);

            $router->get('profile/{user}/documents', 'User\DocumentController@index')->name('profile.documents.index');
            $router->get('profile/{user}/documents/{document}', 'User\DocumentController@show')->name('profile.documents.show');
            $router->post('profile/{user}/documents', 'User\DocumentController@store')->name('profile.documents.store');
            $router->patch('profile/{user}/documents/{document}', 'User\DocumentController@update')->name('profile.documents.update');
            $router->put('profile/{user}/documents/{document}', 'User\DocumentController@update')->name('profile.documents.update');
            $router->delete('profile/{user}/documents/{document}', 'User\DocumentController@destroy')->name('profile.documents.destroy');

            $router->get('profile/{user}/locations', 'User\LocationController@index')->name('profile.locations.index');
            $router->get('profile/{user}/locations/{location}', 'User\LocationController@show')->name('profile.locations.show');
            $router->post('profile/{user}/locations', 'User\LocationController@store')->name('profile.locations.store');
            $router->patch('profile/{user}/locations/{location}', 'User\LocationController@update')->name('profile.locations.update');
            $router->put('profile/{user}/locations/{location}', 'User\LocationController@update')->name('profile.locations.update');
            $router->delete('profile/{user}/locations/{location}', 'User\LocationController@destroy')->name('profile.locations.destroy');

            $router->get('profile/{user}', 'User\UserController@index')->name('user.profile.index');
            $router->get('profile/{user}', 'User\UserController@show')->name('user.profile.index');

            $router->get('profile/{user}/vehicles', 'User\VehiclesController@index')->name('profile.vehicles.index');
            $router->get('profile/{user}/vehicles/{vehicle}', 'User\VehiclesController@show')->name('profile.vehicles.show');
            $router->post('profile/{user}/vehicles', 'User\VehiclesController@store')->name('profile.vehicles.store');
            $router->patch('profile/{user}/vehicles/{vehicle}', 'User\VehiclesController@update')->name('profile.vehicles.update');
            $router->put('profile/{user}/vehicles/{vehicle}', 'User\VehiclesController@update')->name('profile.vehicles.update');
            $router->delete('profile/{user}/vehicles/{vehicle}', 'User\VehiclesController@destroy')->name('profile.vehicles.destroy');

            $router->resource('avatar', 'User\AvatarController', ['only' => ['store']]);
            $router->get('benefits', 'User\BenefitsController@index');
            $router->get('team-feedback/{team_id}', 'User\FeedbackReportController@index');
            $router->post('team/block', 'User\Team\MemberController@blockMember')->name('teams.block');
            $router->post('team/unblock', 'User\Team\MemberController@unblockMember')->name('teams.unblock');
        });

        // User routes common to admin/user area
        $router->group(['middleware' => 'user'], function ($router) {
            $router->resource('vehicles', 'VehicleController', ['only' => ['select', 'index']]);
            $router->get('users/{id}/avatar', 'UserController@avatar');
            $router->get('options', 'User\JobController@options');
        });

        $router->group(['prefix' => 'directory', 'middleware' => 'user'], function ($router) {
            $router->get('teams', 'Directory\DirectoryController@directory');
            $router->resource('teams/{team}/feedback', 'Directory\FeedbackController', ['only' => ['index']]);
            $router->resource('teams/{team}/documents', 'Directory\DocumentsController', ['only' => ['index']]);
            $router->resource('teams/{team}/locations', 'Directory\LocationsController', ['only' => ['index']]);
            $router->resource('teams/{team}/vehicles', 'Directory\VehiclesController', ['only' => ['index']]);
        });

        // Registration Routes
        $router->post('register', 'Auth\RegisterController@register');
        $router->get('register/check', 'Auth\RegisterController@check');
        $router->get('register/teams', 'Auth\RegisterController@getTeamList');
        $router->post('register/teams/list', 'Admin\Team\TeamController@teamlist');
        $router->post('register/teams', 'Auth\RegisterController@storeTeam');
        $router->patch('register/teams', 'Auth\RegisterController@updateTeam');
        $router->patch('register/update-progress', 'Auth\RegisterController@updateRegistrationProgress');
        $router->post('register/teams/{team}/logo', 'Admin\Team\TeamController@uploadLogo');
        $router->get('register/profile/documents', 'Auth\RegisterController@getDocumentList');
        $router->post('register/profile/{profile}/documents', 'User\DocumentController@store');
        $router->post('register/profile/{profile}/documents/{documents}', 'User\DocumentController@destroy');
    }
);

$router->get('download/invoices/{invoice_id}', 'User\InvoiceController@download');

//fail all apis at this point
$router->any('api/{path?}', 'AppController@notFound')->where('path', '.*');

//fail all GET app,src,assets,components,bower_components urls with 404
$router->any('app/{path?}', 'AppController@notFound')->where('path', '.*');
$router->any('assets/{path?}', 'AppController@notFound')->where('path', '.*');
$router->any('bower_components/{path?}', 'AppController@notFound')->where('path', '.*');
$router->any('src/{path?}', 'AppController@notFound')->where('path', '.*');
$router->any('components/{path?}', 'AppController@notFound')->where('path', '.*');

//Load angular application on /login /admin /user
$router->get('login/{path?}', 'AppController@angularApp')->where('path', '.*');
$router->get('admin/{path?}', 'AppController@angularApp')->where('path', '.*');
$router->get('user/{path?}', 'AppController@angularApp')->where('path', '.*');

$router->get('{path?}', 'AppController@angularApp')->where('path', '.*');
