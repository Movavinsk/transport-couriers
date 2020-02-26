'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.feedbacks', {
        url: '/feedback',
        page: {
          title: 'Feedbacks',
          class: 'icon-layers'
        },
        controller: 'AdminFeedbackController',
        templateUrl: 'src/admin/feedback/feedback.html',
        menu: {
          name: 'Feedbacks',
          class: 'icon-star',
          tag: 'admin',
          priority: 9
        }
      });
  });
