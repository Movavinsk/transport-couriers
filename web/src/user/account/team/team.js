/**
 * Created by ROBI on 2015.05.06..
 */
'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team', {
        url: '/team?team_id',
        preserveQueryParams: true,
        page: {
          title: 'My Users',
          description: 'My Users'
        },
        controller: 'UserTeamManageController',
        templateUrl: 'src/user/account/team/team.html'
      })
    ;
  });
