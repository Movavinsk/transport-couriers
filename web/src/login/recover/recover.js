'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('login.recover', {
                url: '/recover',
                page: {
                    title: 'Recover Password'
                },
                templateUrl: 'src/login/recover/recover.html',
                controller: 'RecoverController'
            })
        ;
    });
