'use strict';

angular.module('app')
    .controller('SuccessController', function ($scope, $auth, $location) {
        $('body,html').animate({
            scrollTop: 0,
        }, 500);

        $scope.goToDashboard = function() {
            $auth.check();
            $location.path('user/dashboard');
        };

        $scope.getYear = function() {
            var currentdate = new Date();
            return currentdate.getFullYear();
        }
    });
