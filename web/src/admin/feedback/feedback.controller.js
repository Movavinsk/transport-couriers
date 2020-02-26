'use strict';

angular.module('app')
.controller('AdminFeedbackController', function ($scope, $location, $err, $restAdmin, ngTableParams) {

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
                $err.tryPromise($restAdmin.all('feedbacks').getList(params.url())).then(function (result) {
                    $scope.tableParams.settings({total: result.paginator.total});
                    $defer.resolve(result);
                });
            }
        });

    $scope.delete = function(feedback) {
        if (confirm("Are you sure?")) {
            feedback.remove().then(function() {
                $scope.tableParams.reload();
            });
        }
    };
});
