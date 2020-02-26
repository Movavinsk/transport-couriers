'use strict';

angular.module('app')
  .controller('UserJobsCancelController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment) {

    if (!modalParams.job_id) return;

    $scope.job_id = modalParams.job_id || null;

    $scope.formSubmitted = false;

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
      $scope.job = data;
    });

    $scope.cancelJob = function () {
      $scope.formSubmitted = true;
      $scope.job.status = 'cancel';
      $scope.job.status_date = $moment().format();
      $err.tryPromise($scope.job.put()).then(function () {
        $scope.formSubmitted = false;
        $scope.$close(true);
        $notifier.success('Job cancelled successfully');
      });
    };
  });
