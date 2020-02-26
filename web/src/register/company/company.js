'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('register.company', {
                url: '/company',
                page: {
                    title: 'Company',
                },
                templateUrl: 'src/register/company/company.html',
                controller: 'CompanyController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            });
    });
