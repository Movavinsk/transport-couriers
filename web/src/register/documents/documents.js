'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.documents', {
                url: '/documents',
                page: {
                    title: 'Documents'
                },
                templateUrl: 'src/register/documents/documents.html',
                controller: 'DocumentController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
