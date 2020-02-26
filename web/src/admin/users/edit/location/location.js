'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.users.edit.addlocation', {
        url: '/locations/add',
        page: {
          title: 'Add location',
          class: 'icon-envelope',
          description: 'Add new location'
        },
        modal: 'md',
        controller: 'AdminUserLocationsEditController',
        templateUrl: 'src/admin/users/edit/location/location.html'
      })
      .state('admin.users.edit.editlocation', {
        url: '/locations/edit/{location_id}',
        page: {
          title: 'Edit location',
          class: 'icon-envelope',
          description: 'Edit location'
        },
        modal: 'md',
        controller: 'AdminUserLocationsEditController',
        templateUrl: 'src/admin/users/edit/location/location.html'
      });
  });
