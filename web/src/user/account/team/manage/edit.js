'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.adduser', {
        url: '/{team_id}/add',
        preserveQueryParams: true,
        page: {
          title: 'Add User',
          class: 'icon-layers',
          description: 'Add User'
        },
        modal: 'lg',
        controller: 'UserTeamEditMemberController',
        templateUrl: 'src/user/account/team/manage/edit.html',
        primaryTeamMember: true
      })
      .state('user.account.team.edituser', {
        url: '/edit/{user_id}',
        page: {
          title: 'Members',
          class: 'icon-user',
          description: 'Manage all members'
        },
        modal: 'lg',
        controller: 'UserTeamEditMemberController',
        templateUrl: 'src/user/account/team/manage/edit.html',
        primaryTeamMember: true
      });
  });
