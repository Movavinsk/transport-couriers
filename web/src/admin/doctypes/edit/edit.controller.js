'use strict';

angular.module('app')
    .controller('AdminDocumentTypesEditController', function($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err) {

        $scope.mode = 'Loading...';

        $scope.doctypeCreated = false;

        $scope.id = $stateParams.id || null;

        $scope.data = {};

        $scope.isAdd = function() {
            return $scope.id === null;
        };

        $scope.isEdit = function() {
            return $scope.id !== null;
        };

        if($scope.isAdd())
        {
            $scope.mode = 'Add';
        }
        else
        {
            $err.tryPromise($restAdmin.one('doctypes', $scope.id).get()).then(function(data) {
                $scope.mode = 'Edit';
                $scope.data = data;
            });
        }

        $scope.store = function() {
            $scope.doctypeCreated = true;
            $err.tryPromise($restAdmin.all('doctypes').post($scope.data)).then(function() {
                $app.goTo('admin.doctypes');
            },function(error){
                $scope.doctypeCreated = false;
            });
        };

        $scope.update = function() {
            $err.tryPromise($scope.data.put()).then(function() {
                $app.goTo('admin.doctypes');
            });
        };

        $scope.destroy = function() {
            $err.tryPromise($scope.data.remove()).then(function() {
                $app.goTo('admin.doctypes');
            });
        };

        $scope.cancel = function() {
            $app.skipTo('admin.doctypes');
        };


    });
