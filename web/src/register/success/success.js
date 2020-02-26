'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.success', {
                url: '/success',
                page: {
                    title: 'Registration Completed'
                },
                templateUrl: 'src/register/success/success.html',
                controller: 'SuccessController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
