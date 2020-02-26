'use strict';

angular.module('app')
  .controller('UserWorkRetractController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err) {

    if (!modalParams.bid_id) return;

    $scope.bid_id = modalParams.bid_id || null;

    $scope.formSubmitted = false;

    $err.tryPromise($restUser.one('bids', $scope.bid_id).get()).then(function (data) {
      $scope.data = data;
    });

    $scope.retractBid = function(job, bid) {
      $scope.formSubmitted = true;
      $restUser.one('team').one('work', $scope.data.job_id).one('bid', $scope.data.id).post('retract').then(function() {
        $scope.formSubmitted = false;
        $scope.$close(true);
        $notifier.success('Bid successfully retracted!');
      });
    }
  });
