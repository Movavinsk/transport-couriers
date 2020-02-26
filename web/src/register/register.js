'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register', {
                url: '/register',
                page: {
                    title: 'Registration'
                },
                templateUrl: 'src/register/register.html'
            })
        ;
    });
