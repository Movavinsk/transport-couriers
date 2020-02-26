'use strict';

angular.module('app')
  .controller('TeamLocationsController', function($q, $location, $scope, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, ngTableParams) {

    $auth.assure(function() {
        $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;

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
              $err.tryPromise($restUser.one('teams', $auth.user().team_id).all('locations').getList(params.url())).then(function (result) {
                $scope.tableParams.settings({total: result.paginator.total});
                $defer.resolve(result);
              });
            }
          });
    });

    $scope.destroy = function(location) {
      $err.tryPromise(location.remove()).then(function () {
        $notifier.success('Location removed successfully');
        $scope.tableParams.reload()
      });
    };
  });
