'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.dashboard.details', {
        url: '/job-details/{job_id}',
        page: {
          title: 'Job Details',
          class: 'icon-layers',
          description: 'Job Details'
        },
        modal: 'lg',
        controller: 'UserDashboardDetailsController',
        templateUrl: 'src/user/dashboard/details/details.html'
      });
  });
