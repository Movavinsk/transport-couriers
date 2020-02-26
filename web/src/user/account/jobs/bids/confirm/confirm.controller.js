'use strict';

angular.module('app')
  .controller('UserJobsBidsConfirmController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment) {

    $scope.formSubmitted = false;

    if (!modalParams.job_id) return;
    if (!modalParams.bid_id) return;

    $scope.job_id = modalParams.job_id || null;
    $scope.bid_id = modalParams.bid_id || null;

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
      $scope.job = data;
    });

    var query = {
      filter: {
        job_id: $scope.job_id,
        id: $scope.bid_id
      }
    };
    $err.tryPromise($restUser.all('bids').getList(flattenParams(query))).then(function (data) {
      $scope.bid = data[0];
    });

    $scope.confirmBid = function () {
      $scope.formSubmitted = true;
      $scope.job.status = 'progress';
      $scope.job.status_date = $moment().format();
      $scope.job.bid_id = $scope.bid_id;
      $scope.job.bid_user_id = $scope.bid.user_id;
      $scope.job.bid_amount = $scope.bid.amount;
      $scope.job.bid_details = $scope.details;
      $err.tryPromise($scope.job.put()).then(function () {
        $notifier.success('Bid accepted successfully');
        $scope.$close(true);
      }, function (error) {
        $scope.formSubmitted = false;
      });
    };
  });
