'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.feedback', {
        url: '/feedback',
        page: {
          title: 'My feedback',
          class: 'icon-layers',
          description: 'My feedback'
        },
        controller: 'UserFeedbackController',
        templateUrl: 'src/user/account/feedback/feedback.html'
      });
  });
