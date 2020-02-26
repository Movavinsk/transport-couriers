'use strict';

angular.module('app')
  .controller('AdminTeamsController', function ($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restAdmin, $moment) {

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
          $err.tryPromise($restAdmin.all('teams').getList(params.url())).then(function (result) {
            $scope.tableParams.settings({total: result.paginator.total});
            $defer.resolve(result);
          });
        }
      });

    $scope.deactivate = function (team) {
      team.is_expired = ! team.is_expired;
      if (team.is_expired) {
        team.deactivated_at = $moment();
      } else {
        team.deactivated_at = null;
      }
      team.save();
    };

    $scope.toggleBidding = function (team) {
      team.can_bid = !!team.can_bid;
      team.save();
    };

    $scope.createDate = function(date) {
      return new Date(date);
    }

    $scope.updateType = function(team){
      team.save();
    }
  });
