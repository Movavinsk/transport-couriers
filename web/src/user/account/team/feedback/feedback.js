'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.feedback', {
        url: '/feedback',
        page: {
          title: 'My feedback',
          class: 'icon-layers',
          description: 'My feedback'
        },
        controller: 'TeamFeedbackController',
        templateUrl: 'src/user/account/team/feedback/feedback.html'
      });
  });
