'use strict';

angular.module('app')
    .controller('RegisterController', function ($scope, $app, $state, $err, $notifier, $location, $restApp) {
        $scope.formData = {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            subscribe: false,
            agreeTermsConditions: false,
        };
        $scope.errors = null;
        $scope.success = false;

        $scope.register = function () {
            $scope.errors = null;
            $scope.success = false;

            $restApp.all('register').post($scope.formData).then(function () {
                $scope.success = true;
                $notifier.success('Registration was successful');
            }, function (error) {
                $notifier.error('Something went wrong');
                if (typeof error.data === 'object') {
                    return $scope.errors = _(error.data)
                        .values()
                        .flatten()
                        .value();
                }
            });
        };
    });
