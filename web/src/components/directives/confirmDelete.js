'use strict';

angular.module('app.components')
    .directive('confirmDelete', function($modal) {

    return {
        restrict: 'A',
        scope: {
            'confirmDelete': '&',
        },
        link: function(scope, element, attrs) {

            var modalInstance = undefined;
            var modalTemplate = 'src/theme/modals/confirm-delete.html';

            var modalController = function($scope) {
                $scope.ok = function() {
                    scope.confirmDelete();
                    modalInstance.dismiss();
                }
                $scope.cancel = function() {
                    modalInstance.dismiss();
                }
            }

            element.on('click', function() {
                modalInstance = $modal.open({
                  templateUrl: modalTemplate,
                  controller: modalController,
                })
            })
        }
    }
})