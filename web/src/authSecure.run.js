'use strict';

// Implement authentication security

angular.module('app')
  .run(function ($rootScope, $state, $auth, $notifier, $guard) {

    $guard.watch();
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

      function process() {
        // Guest user inside restricted areas
        if ($auth.isGuest() && ( toState.name.match('^admin.') || toState.name.match('^user.') )) {
          event.preventDefault();
          $state.transitionTo('login');
          // Any user on login form
        } else if ($auth.isUser() && toState.name == 'login') {
          event.preventDefault();
          if ($auth.isAdmin()) {
            $state.transitionTo('admin.dashboard');
          } else {
            $state.transitionTo('user.dashboard');
          }
          // Non-admin inside Admin area
        } else if (!$auth.isAdmin() && toState.name.match('^admin.')) {
          event.preventDefault();
          $auth.logout().then(function () {
            $notifier.error('Restricted area, you must login as Admin');
            $state.transitionTo('login');
          });
        }
      }

      if (!$auth.bootstrapped()) {
        $auth.check().then(function () {
          process();
        }, function () {
          process();
        });
      } else {
        process();
      }
    });

  });