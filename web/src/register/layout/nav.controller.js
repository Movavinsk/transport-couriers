'use strict';

angular.module('app')
    .controller('NavController', function($scope, $location) {
        $scope.isActive = function (path) {
            if (path === '/register/company') {
                var active = (path === $location.path() || $location.path() === '/register/company/location');
            } else if (path === '/register/invoice') {
                var active = (path === $location.path() || $location.path() === '/register/invoice/footer' || $location.path() === '/register/invoice/recipient');
            } else if (path === '/register/documents') {
                var active = (path === $location.path() || $location.path() === '/register/success');
            } else {
                var active = (path === $location.path());
            }
            return active;
        };
    });
