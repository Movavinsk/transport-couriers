'use strict';

angular.module('app.components')
    .directive('confirmModal', function($modal) {

    return {
        restrict: 'A',
        scope: {
            'confirmModal': '&',
        },
        link: function(scope, element, attrs) {

            var modalInstance = undefined;
            var modalTemplate = 'src/theme/modals/confirm-modal.html';

            var modalController = function($scope) {
                $scope.ok = function() {
                    scope.confirmModal();
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
