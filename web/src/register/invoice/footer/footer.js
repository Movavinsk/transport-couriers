'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('register.invoice.footer', {
                url: '/footer',
                page: {
                    title: 'Invoice footer text'
                },
                templateUrl: 'src/register/invoice/footer/footer.html',
                controller: 'FooterController',
                resolve: {
                    userRegistration: function resolveAuthentication ($auth) {
                        return $auth.isRegistered();
                    },
                },
            })
        ;
    });
