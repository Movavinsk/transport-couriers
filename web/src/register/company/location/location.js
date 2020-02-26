'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.company.location', {
                url: '/location',
                page: {
                    title: 'Location'
                },
                templateUrl: 'src/register/company/location/location.html',
                controller: 'LocationController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
