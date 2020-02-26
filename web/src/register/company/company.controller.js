'use strict';

angular.module('app')
    .controller('CompanyController', function ($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
        $scope.errors = null;
        $scope.teams = [];
        $scope.ctype = null;
        $scope.checked = false;
        $scope.disableCompanyNumber = false;
        $scope.formData = {
            team_id: '',
            company_name: '',
            company_number: '',
            vat_number: '',
        };

        $scope.address = function () {
            $scope.errors = null;

            if ($scope.ctype === 'Sole Trader') {
                $scope.formData.company_number = $scope.ctype;
            }

            $scope.formData.registration_progress = 'company_location';

            $restApp.all('register/teams').post($scope.formData).then(function (data) {
                $notifier.success('Company details updated successfully');
                $restApp.all('register/update-progress').patch($scope.formData);
                $location.path('/register/company/location');
            }, function (error) {
                if ($scope.ctype === 'Sole Trader') {
                    $scope.formData.company_number = '';
                }
                $notifier.error('Something went wrong');
                if (typeof error.data === 'object') {
                    return $scope.errors = _(error.data)
                        .values()
                        .flatten()
                        .value();
                }
            });
        };

        $scope.companyType = function (data) {
            $scope.ctype = data;
            if ($scope.ctype === 'Sole Trader') {
                $scope.formData.company_number = '';
            }
        };

        $scope.isChecked = function (data) {
            if ($scope.ctype === data) {
                return true;
            }
        };
    });
