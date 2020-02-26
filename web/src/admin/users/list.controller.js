'use strict';

angular.module('app')
  .controller('AdminUsersController', function ($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $notifier) {

    $restAdmin.all('roles').getList().then(function (roles) {
      $scope.roles = roles;
    });

    $scope.tableParams = new ngTableParams(
      angular.extend(
        {
          page: 1,
          count: 10,
          sorting: {
            name: 'asc'
          }
        },
        $location.search()
      ), {
        total: 0,
        getData: function ($defer, params) {
          $location.search(params.url());
          $err.tryPromise($restAdmin.all('users').getList(params.url())).then(function (result) {
            $scope.tableParams.settings({total: result.paginator.total});
            $defer.resolve(result);
          });
        }
      });

    $scope.inactivate = function (user) {
      user.inactivated = !user.inactivated;
      user.save();
    };

    $scope.createDate = function(date) {
      return new Date(date);
    }

    $scope.capitalizeFirstLetter = function(word){
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

  });
