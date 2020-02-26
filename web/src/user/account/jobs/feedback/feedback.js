'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.jobs.feedback', {
        url: '/{job_id}/feedback',
        page: {
          title: 'Read Feedback',
          class: 'icon-layers',
          description: 'Read feedback'
        },
        modal: 'md',
        controller: 'UserJobsFeedbackController',
        templateUrl: 'src/user/account/jobs/feedback/feedback.html'
      });
  });
