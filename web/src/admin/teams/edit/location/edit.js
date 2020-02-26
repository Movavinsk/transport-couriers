'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.teams.edit.addlocation', {
        url: '/new',
        page: {
          title: 'Add location',
          class: 'icon-envelope',
          description: 'Add new location'
        },
        modal: 'md',
        controller: 'AdminTeamLocationsEditController',
        templateUrl: 'src/user/account/team/locations/edit/edit.html'
      })
      .state('admin.teams.edit.editlocation', {
        url: '/edit/{location_id}',
        page: {
          title: 'Edit location',
          class: 'icon-envelope',
          description: 'Edit location'
        },
        modal: 'md',
        controller: 'AdminTeamLocationsEditController',
        templateUrl: 'src/user/account/team/locations/edit/edit.html'
      });
  });
