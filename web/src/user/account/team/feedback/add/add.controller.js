'use strict';

angular.module('app')
  .controller('UserFeedbackAddController', function (modalParams, $scope, $restUser, $err, $notifier, $state) {

    if (!modalParams.job_id) {
      return;
    }

    $scope.job_id = modalParams.job_id || null;
    $scope.formSubmitted = false;

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (job) {
      $scope.job = job;
    });

    $scope.create = function () {
      $scope.formSubmitted = true;
      $scope.job
        .post('feedback', {
          rating: $scope.feedback.rating,
          comment: $scope.feedback.comment,
          bid_id: modalParams.bid_id
        })
        .then(function () {
          $scope.$dismiss();
          $notifier.success("Feedback sent successfully");
          $scope.formSubmitted = false;
          $state.reload();
        });
    };
  });
