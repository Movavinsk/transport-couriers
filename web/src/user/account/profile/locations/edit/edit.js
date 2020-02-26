'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.profile.locations.add', {
        url: '/new',
        page: {
          title: 'Add location',
          class: 'icon-envelope',
          description: 'Add new location'
        },
        modal: 'md',
        controller: 'UserProfileLocationsEditController',
        templateUrl: 'src/user/account/profile/locations/edit/edit.html'
      })
      .state('user.account.profile.locations.edit', {
        url: '/edit/{id}',
        page: {
          title: 'Edit location',
          class: 'icon-envelope',
          description: 'Edit location'
        },
        modal: 'md',
        controller: 'UserProfileLocationsEditController',
        templateUrl: 'src/user/account/profile/locations/edit/edit.html'
      });
  });
