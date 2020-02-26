'use strict';

angular.module('app')
    .controller('ProgressController', function ($scope, $location) {
        $scope.init = function () {
            setTimeout(function () {
                var elm = $('#navbar .active');
                var x = elm.offset();
                if (x) {
                    var ratio = elm.width() / 2;
                    var progressBar = ratio + x.left + 'px';

                    if ($location.path() === '/register/success') {
                        progressBar = '100%';
                    }
                    $('#status').css('width', progressBar);
                }
            }, 500);
        };
    });
