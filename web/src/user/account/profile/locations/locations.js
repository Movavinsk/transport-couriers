'use strict';

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('user.account.profile.locations', {
        url: '/locations',
        page: {
          title: 'Locations',
          class: 'icon-layers',
          description: 'Locations'
        },
        controller: 'UserProfileLocationsController',
        templateUrl: 'src/user/account/profile/locations/locations.html'
      });
  });