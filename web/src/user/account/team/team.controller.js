'use strict';

angular.module('app')
  .controller('UserTeamManageController', function ($rootScope, $auth, $notifier, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restUser) {

  $scope.loading = true;

  $scope.new_primary = {confirm: false, user: null};

  $scope.refreshTeam = function() {
    $restUser.one('team', $auth.user().team_id).get().then(function(team) {
      $scope.loading = false;
      $scope.team = team;
    });
  };

  $auth.assure(function() {
    $scope.refreshTeam();
  });

  $scope.transferPrimaryUser = function () {
    $restUser.one('team', $auth.user().team_id).one('members', $scope.new_primary.user.id).one('mark-as-primary').put().then(function () {
      $notifier.success('The primary user role was transferred.');
      $auth.check(); // reload the current user object
      $location.path('user/dashboard');
    });
  };
});
