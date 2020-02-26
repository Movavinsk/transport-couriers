'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.invoice.recipient', {
                url: '/recipient',
                page: {
                    title: 'Recipient details'
                },
                templateUrl: 'src/register/invoice/recipient/recipient.html',
                controller: 'RecipientController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
