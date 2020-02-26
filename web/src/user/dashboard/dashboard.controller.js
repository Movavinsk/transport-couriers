'use strict';

angular.module('app')
.controller('UserDashboardController', function($rootScope, $scope, $restUser, $restApp, $auth, $notifier, $app, $err) {

    var params = {
        page: "1",
        count: "4",
        'sorting[pickup_date]': "desc"
    };

    function refresh()
    {
      $err.tryPromise($restUser.one('profile', $auth.user().id).all('events').getList(flattenParams({count: 6, sorting: {created_at: "desc"}}))).then(function (result) {
        $scope.myEvents = result;
      });

      $restUser.one('profile', $auth.user().id).get().then(function(data) {
        $scope.ratings = data.ratings_count;
        $scope.rating = data.score;
        $scope.client_api = data.can_use_client_api;
        $scope.oauth_client = data.oauth_client;
      });
    }

    // If not bootstrapped then wait till auth.bootstrap
    if( ! $auth.bootstrapped() )
    {
      $scope.$on('auth.bootstrap', function() {
        refresh();
      });
    }
    else
    {
      refresh();
    }

    $scope.toggleEventStatus = function(event) {
        event.status = event.status == 'read' ? 'new' : 'read';
        event.save();
    };

    $err.tryPromise($restUser.all('jobs').getList(params)).then(function (result) {
        $scope.myJobs = result;
    });

    $err.tryPromise($restUser.all('jobs').all('work').getList(params)).then(function (result) {
      $scope.myBids = result;
    });
});
