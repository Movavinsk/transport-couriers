'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.invoice', {
                url: '/invoice',
                page: {
                    title: 'Invoice Details'
                },
                templateUrl: 'src/register/invoice/invoice.html',
                controller: 'InvoiceController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
