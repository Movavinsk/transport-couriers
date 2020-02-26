'use strict';

angular
    .module('app')
    .controller('AdminPartnersEditController', AdminPartnersEditController);

AdminPartnersEditController.$inject = ['$scope', '$restAdmin', '$stateParams', '$err', 'ngTableParams', '$notifier', '$app'];

function AdminPartnersEditController($scope, $restAdmin, $stateParams, $err, ngTableParams, $notifier, $app) {

    $scope.partner_id = $stateParams.partner_id || null;

    $scope.isAdd = function () {
      return $scope.partner_id === null;
    };

    $scope.isEdit = function () {
      return !! $scope.partner_id;
    };

    if ($scope.isAdd()) {

        $scope.mode = 'Add';
        $scope.data = {};

    } else {

        $scope.mode = 'Edit';

        // fetch partner details
        $err.tryPromise($restAdmin.one('partners', $scope.partner_id).get())
            .then(function (data) {
                $scope.data = data;
                $scope.benefits = new ngTableParams(
                    angular.extend({page: 1, count: 10, sorting: {name: 'asc'} }), {
                        total: 0,
                        getData: function ($defer, params) {
                            $defer.resolve($scope.data.benefits);
                        }
                    });
            });
    }

    $scope.update = function() {
        $err.tryPromise($scope.data.put()).then(function () {
          $notifier.success('Partner details updated.');
          $app.goTo('admin.partners');
        });
    }

    $scope.store = function() {
        $err.tryPromise($restAdmin.all('partners').post($scope.data))
            .then(function (response) {
                $notifier.success('Partner details updated.');
                $app.goTo('admin.partners');
            })
            .catch(function(err) {
                $notifier.error('Errors while saving new Partner.');
            })
    }

    $scope.deactivate = function(benefit) {
        $scope.data.active = false;
        $scope.update();
    }

}