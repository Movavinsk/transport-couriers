'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.locations', {
        url: '/locations',
        page: {
          title: 'Locations',
          class: 'icon-layers',
          description: 'Locations'
        },
        controller: 'TeamLocationsController',
        templateUrl: 'src/user/account/team/locations/locations.html'
      });
  });