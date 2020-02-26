'use strict';

angular.module('app')
    .controller('LoginController', function ($scope, $app, $state, $err, $auth) {

        $scope.auth = $auth;

        $scope.login = function (email, password) {
            $err.tryPromise($auth.login(email, password)).then(function (data) {
                if (data.registration_status == 'complete' || data.registration_status == 'backend') {
                    $scope.email = '';
                    $scope.password = '';
                    $app.goTo(($auth.isAdmin() ? 'admin' : 'user') + '.dashboard');
                } else {
                    switch (data.registration_progress) {
                        case 'company_location':
                            $app.goTo('register.company.location');
                            break;
                        case 'invoice':
                            $app.goTo('register.invoice');
                            break;
                        case 'recipient_details':
                            $app.goTo('register.invoice.recipient');
                            break;
                        case 'invoice_footer_details':
                            $app.goTo('register.invoice.footer');
                            break;
                        case 'documents':
                            $app.goTo('register.documents');
                            break;
                        default:
                            $app.goTo('register.company');
                    }
                }
            });
        };

        $scope.logout = function () {
            $err.tryPromise($auth.logout()).then(function () {
                $app.goTo('login');
            });
        };
    });
