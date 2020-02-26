'use strict';

angular.module('app')
  .controller('LatestJobsController', function($rootScope, $scope, $auth, $err, $restUser) {

    $auth.assure(function () {
      var params = {
        count: 4,
        sorting: {created_at: "desc"},
        filter: {pickup_miles: 50, in_areas: $auth.user().id}
      };

      $err.tryPromise($restUser.all('jobs').all('browse').getList(flattenParams(params))).then(function (result) {
        $scope.data = result;
      });
    });
  });