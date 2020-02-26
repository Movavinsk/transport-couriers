'use strict';

angular
  .module('app')
  .controller('UserProfileDocumentsController', UserProfileDocumentsController);

  UserProfileDocumentsController.$inject = ["$q", "$location", "$scope", "$auth", "$restUser", "$notifier", '$err', "ngTableParams", "$moment"];

  function UserProfileDocumentsController($q, $location, $scope, $auth, $restUser, $notifier, $err, ngTableParams, $moment) {

  $auth.assure(function() {
      $scope.user_id = $scope.id = $location.search().user_id ? $location.search().user_id : $auth.user().id;

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
            $err.tryPromise($restUser.one('profile', $scope.user_id).all('documents').getList(params.url())).then(function (result) {
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
      })
    }

  }
