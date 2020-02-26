'use strict';

angular.module('app')
    .controller('AdminJobsController', function ($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {

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
                    $err.tryPromise($restAdmin.all('jobs').getList(params.url())).then(function (result) {
                        $scope.tableParams.settings({total: result.paginator.total});
                        $defer.resolve(result);
                    });
                }
            });
    });