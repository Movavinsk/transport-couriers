'use strict';

/* jshint undef: false */

angular.module('app.components').factory('$app', function ($rootScope, $location, $state, $stateParams) {

    function isMode (mode) {
        return !!$location.url().match('^/' + mode);
    }

    return {
        reload: function () {
            $state.transitionTo($state.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true,
            });
        },
        goTo: function (newState) {
            $state.transitionTo(newState, $stateParams, { //reload until this state
                reload: newState,
                inherit: false,
                notify: true,
            });
        },
        skipTo: function (newState) { // Does not reload state tree
            $state.transitionTo(newState, $stateParams);
        },
        mode: function () {
            if (isMode('login')) {
                return 'login';
            } else if (isMode('admin')) {
                return 'admin';
            } else if (isMode('user')) {
                return 'user';
            } else {
                return null;
            }
        },

        redirectUser: function (registration_progress) {
            switch (registration_progress) {
                case 'company_location':
                    $location.path('/register/company/location');
                    break;
                case 'invoice':
                    $location.path('/register/invoice');
                    break;
                case 'recipient_details':
                    $location.path('/register/invoice/recipient');
                    break;
                case 'invoice_footer_details':
                    $location.path('/register/invoice/footer');
                    break;
                case 'documents':
                    $location.path('/register/documents');
                    break;
                default:
                    $location.path('register/company');
            }
        },
    };

});
