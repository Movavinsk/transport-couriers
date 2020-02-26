'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.teams.edit.logo', {
        url: '/{team_id}/logo',
        page: {
          title: 'Manage Company Logo',
          class: 'icon-envelope',
          description: 'Add/Edit Logo'
        },
        modal: 'lg',
        controller: 'TeamLogoController',
        templateUrl: 'src/admin/teams/edit/logo/logo.html'
      });
  });
