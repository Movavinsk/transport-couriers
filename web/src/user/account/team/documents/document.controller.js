'use strict';

angular.module('app')
  .controller('TeamDocumentController', function($q, $location, $scope, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, ngTableParams) {

    $auth.assure(function() {
        $scope.user_id = $scope.id = $location.search().user_id ? $location.search().user_id : $auth.user().id;
        $scope.team_id = $scope.team = $location.search().team_id ? $location.search().team_id : $auth.user().team_id;

        $scope.tableParams = new ngTableParams(
          angular.extend(
            {
              page: 1,
              count: 10,
              sorting: {
                title: 'asc'
              }
            },
            $location.search()
          ), {
            total: 0,
            getData: function ($defer, params) {
              $location.search(params.url());
              $err.tryPromise($restUser.one('teams', $auth.user().team_id).all('documents').getList(params.url())).then(function (result) {
                $scope.tableParams.settings({total: result.paginator.total});
                $defer.resolve(result);
              });
            }
          });
    });


    $scope.destroy = function(document) {
      $err.tryPromise(document.remove()).then(function () {
        $notifier.success('Document removed successfully');
        $scope.tableParams.reload()
      });
    };
  });
