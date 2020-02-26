'use strict';

angular.module('app').controller('ResetController', function ($scope, $app, $state, $stateParams, $err, $auth, $notifier, $location) {

    $scope.reset = function () {
        $err.tryPromise($auth.reset($scope.password, $scope.password_confirmation, $stateParams.token)).then(function (response) {
            $notifier.success('Updated successfully.');
            /**
             * inactivated - 0 (active), 1 (inactive)
             */
            if (!response.inactivated) {
                $auth.check().then(function () {
                    $app.goTo('login');
                });
            } else if (response.inactivated && response.registration_complete) {
                $app.goTo('login');
            } else if (response.inactivated && !response.registration_complete) {
                switch (response.registration_progress) {
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
});
