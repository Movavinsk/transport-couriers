'use strict';

angular.module('app')
  .controller('UserJobsManualController', function ($err, $scope, modalParams, $restUser, $notifier, $moment) {

    if (!modalParams.job_id) return;

    $scope.job_id = modalParams.job_id || null;

    $scope.loading = true;

    $scope.formSubmitted = false;

    $scope.job = {}

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
      $scope.loading = false;
      $scope.job = data;
    });

    $scope.setUserId = function($item, $model) {
      $scope.job.bid_user_id = $model.id;
      $scope.job.bid_add_vat = $model.team.invoice_details.invoice_including_vat;
    }

    $scope.getUsers = function(value) {
      return $restUser.all('user').getList(flattenParams({filters: {search: value, inactivated: 0}})).then(function (result) {
        return result.plain();
      });
    }

    $scope.store = function() {
      $scope.formSubmitted = true;
      $scope.job.bid_manual = 1;
      $scope.job.status = 'progress';
      $scope.job.status_date = $moment().format();

      $err.tryPromise($scope.job.put()).then(function () {
        $notifier.success('Job allocated successfully');
        $scope.$close(true);
      }, function () {
        $notifier.error('Job allocation error');
        $scope.formSubmitted = false;
      });
    }
  });
