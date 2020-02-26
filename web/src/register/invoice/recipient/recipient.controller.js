'use strict';

angular.module('app')
    .controller('RecipientController', function ($rootScope, $scope, $app, $state, $notifier, $location, $restApp) {
        $scope.errors = null;
        $scope.formData = {
            team_id: '',
            invoice_recipient_name: '',
            invoice_recipient_email: '',
            invoice_recipient_phone: '',
        };

        $scope.submit = function () {
            $scope.errors = null;
            $scope.formData.team_id = $rootScope.userRegistration.team_id;
            $scope.formData.registration_progress = 'invoice_footer_details';

            $restApp.all('register/teams').patch($scope.formData).then(function () {
                $notifier.success('Recipient details updated successfully');
                $location.path('/register/invoice/footer');
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

        $scope.nextStep = function () {
            $location.path('register/invoice/footer');
        };
    });
