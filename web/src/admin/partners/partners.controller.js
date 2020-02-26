'use strict';

angular
    .module('app')
    .controller('AdminPartnersController', AdminPartnersController);

AdminPartnersController.$inject = ['$scope', 'ngTableParams', '$restAdmin', '$location', '$err'];

function AdminPartnersController($scope, ngTableParams, $restAdmin, $location, $err) {

    $scope.tableParams = new ngTableParams(
        angular.extend(
            {
                page: 1,
                count: 10,
                sorting: {
                    created_at: 'desc'
                }
            },
            $location.search()
        ), {
            total: 0,
            getData: function ($defer, params) {
                $location.search(params.url());
                $restAdmin.all('partners').getList(params.url())
                    .then(function (result) {
                        $scope.tableParams.settings({total: result.paginator.total});
                        $defer.resolve(result);
                    });
            }
        });

}