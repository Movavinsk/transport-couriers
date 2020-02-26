'use strict';

angular.module('app')
    .controller('AdminVehiclesEditController', function ($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, FileUploader) {

        /**
         *
         * @type {FileUploader}
         */
        $scope.uploader = new FileUploader();

        $scope.mode = 'Loading...';

        $scope.id = $stateParams.id || null;

        $scope.isAdd = function () {
            return $scope.id === null;
        };

        $scope.isEdit = function () {
            return $scope.id !== null;
        };

        if ($scope.isAdd()) {
            $scope.mode = 'Add';
        }
        else {
            $err.tryPromise($restAdmin.one('vehicles', $scope.id).get()).then(function (data) {
                $scope.mode = 'Edit';
                $scope.data = data;
            });
        }

        $scope.store = function () {
            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];

//              item.url = "api/vehicles";
                item.url = $restAdmin.all('vehicles').getRestangularUrl();

//              item.formData.push({'data': JSON.stringify($scope.data)});
                item.formData.push($scope.data);

                $scope.uploader.uploadItem(item);
            } else {
                $err.tryPromise($restAdmin.all('vehicles').post($scope.data)).then(function () {
                    $app.goTo('admin.vehicles');
                });
            }
        };

        $scope.update = function () {
            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];

                item.url = $scope.data.getRestangularUrl() + "?_method=PUT";

                item.formData.push($scope.data);

                $scope.uploader.uploadItem(item);
            } else {
                $err.tryPromise($scope.data.put()).then(function () {
                    $app.goTo('admin.vehicles');
                });
            }
        };

        $scope.destroy = function () {
            $err.tryPromise($scope.data.remove()).then(function () {
                $app.goTo('admin.vehicles');
            });
        };

        $scope.cancel = function () {
            $app.skipTo('admin.vehicles');
        };

        $scope.uploader.onSuccessItem = function (item, response, status, header) {
            $scope.uploader.removeFromQueue(item);
            $app.goTo('admin.vehicles');
        };
    });
