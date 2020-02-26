'use strict';

angular.module('app')
    .controller('LocationController', function ($rootScope, $scope, $auth, $app, $state, $notifier, $location, $restApp, $window) {
        $scope.formData = {
            team_id: $rootScope.userRegistration.team_id,
            postal_code: '',
            address_line_1: '',
            address_line_2: '',
            town: '',
            county: '',
        };

        $scope.data = {
            location: '',
            address: '',
        };
        $scope.enterManually = false;
        $scope.errors = null;

        $scope.$on('$stateChangeStart', function() {
            $restApp.all('register').one('check').get().then(function (data) {
                $app.redirectUser(data.registration_progress);
            });
        });

        $scope.$watch('enterManually', function (newVal) {
            if (newVal == false) {
                $scope.data.location = '';
                $scope.formData = {
                    team_id: $rootScope.userRegistration.team_id,
                    postal_code: '',
                    address_line_1: '',
                    address_line_2: '',
                    town: '',
                    county: '',
                };
            }
        });

        $scope.$watch('data.address', function (newVal) {
            var address1 = '';
            if (newVal) {
                newVal.address_components.forEach(function (address_component) {
                    address_component.types.forEach(function (type) {
                        if (type == 'street_number') {
                            address1 = address_component.long_name;
                        }
                    });
                    address_component.types.forEach(function (type) {
                        if (type == 'subpremise') {
                            var space = (address1 == '') ? '' : ', ';
                            address1 = address1.concat(space, address_component.long_name);
                        }
                    });
                    address_component.types.forEach(function (type) {
                        if (type == 'premise') {
                            var space = (address1 == '') ? '' : ', ';
                            address1 = address1.concat(space, address_component.long_name);
                        }
                    });
                    address_component.types.forEach(function (type) {
                        if (type == 'route') {
                            $scope.formData.address_line_2 = address_component.long_name;
                        }
                    });
                    address_component.types.forEach(function (type) {
                        if (type == 'postal_town') {
                            $scope.formData.town = address_component.long_name;
                        }
                    });
                    if ($scope.formData.town == '') {
                        address_component.types.forEach(function (type) {
                            if (type == 'locality') {
                                $scope.formData.town = address_component.long_name;
                            }
                        });
                    }
                    address_component.types.forEach(function (type) {
                        if (type == 'postal_code') {
                            $scope.formData.postal_code = address_component.long_name;
                        }
                    });
                    address_component.types.forEach(function (type) {
                        if (type == 'administrative_area_level_2') {
                            $scope.formData.county = address_component.long_name;
                        }
                    });
                });
                $scope.formData.address_line_1 = address1;
                $scope.enterManually = true;
            }
        });

        $scope.location = function () {
            $scope.errors = null;
            $scope.formData.registration_progress = 'invoice';
            $restApp.all('register/teams').patch($scope.formData).then(function () {
                $notifier.success('Location details updated successfully');
                $location.path('/register/invoice');
            }, function (response) {
                $scope.errors = response.data;
                $notifier.error('Something went wrong');
            });
        };
        $scope.isEnterManually = function () {
            $scope.enterManually = !$scope.enterManually;
        };
    });
