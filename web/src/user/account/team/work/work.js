'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.work', {
        url: '/work',
        preserveQueryParams: true,
        page: {
          title: 'Our Work',
          class: 'icon-layers',
          description: 'Our Work'
        },
        controller: 'UserTeamWorkController',
        templateUrl: 'src/user/account/team/work/work.html'
      });
  });
