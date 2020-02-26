'use strict';

angular.module('app')
  .controller('UserJobsFeedbackController', function ($scope, $err, modalParams, $restUser) {

    if( ! modalParams.job_id ) return;

    $scope.loading = true;

    $scope.job_id = modalParams.job_id || null;

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function(data) {
      $scope.loading = false;
      $scope.data = data;
    });
  });