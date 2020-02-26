'use strict';

angular.module('app')
  .controller('AdminJobBidsController', function ($rootScope, $state, $stateParams, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {

    if (!$stateParams.id) return;

    $scope.job_id = $stateParams.id || null;

    $scope.tableParams = new ngTableParams(
      angular.extend(
        {
          page: 1,
          count: 10,
          sorting: {
            bid_date: 'desc'
          },
          filter: {
            job_id: $scope.job_id
          }
        }
      ), {
        total: 0,
        getData: function ($defer, params) {
          $location.search(params.url());
          $err.tryPromise($restAdmin.all('bids').getList(params.url())).then(function (result) {
            $scope.tableParams.settings({total: result.paginator.total});
            $defer.resolve(result);
          });
        }
      });
  });
