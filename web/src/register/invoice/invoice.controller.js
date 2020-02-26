'use strict';

angular.module('app')
    .controller('InvoiceController', function ($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
        $scope.errors = null;
        $scope.addressDisabled = true;
        $scope.formData = {
            team_id: '',
            invoice_address_line_1: '',
            invoice_address_line_2: '',
            invoice_town: '',
            invoice_county: '',
            invoice_postal_code: '',
            use_company_address: true,
        };

        $scope.submit = function () {
            $scope.errors = null;
            $scope.formData.team_id = $rootScope.userRegistration.team_id;
            $scope.formData.registration_progress = 'recipient_details';

            $restApp.all('register/teams').patch($scope.formData).then(function () {
                $notifier.success('Invoice details updated successfully');
                $location.path('/register/invoice/recipient');
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

        $scope.isSameAsCompanyAddress = function () {
            $scope.addressDisabled = !$scope.addressDisabled;
        };

        $scope.nextStep = function () {
            $location.path('/register/invoice/recipient');
        };
    });
