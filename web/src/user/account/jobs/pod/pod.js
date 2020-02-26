'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.jobs.pod', {
        url: '/{job_id}/pod',
        page: {
          title: 'My Work',
          class: 'icon-layers',
          description: 'My Work'
        },
        modal: 'lg',
        controller: 'UserJobsPodController',
        templateUrl: 'src/user/account/jobs/pod/pod.html'
      });
  });
