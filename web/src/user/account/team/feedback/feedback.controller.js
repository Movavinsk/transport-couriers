'use strict';

angular.module('app')
  .controller('TeamFeedbackController', function ($scope, $location, $err, $auth, $restUser, ngTableParams) {

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
          $err.tryPromise($restUser.one('teams', $auth.user().team_id).all('feedback').getList(params.url())).then(function (result) {
            $scope.tableParams.settings({total: result.paginator.total});
            $defer.resolve(result);
            $scope.loading = false;
          });
        }
      });
  });
