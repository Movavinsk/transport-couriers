'use strict';

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('user.account.profile.vehicles', {
        url: '/vehicles',
        page: {
          title: 'My Vehicles',
          class: 'icon-layers',
          description: 'Vehicles'
        },
        controller: 'UserProfileVehiclesController',
        templateUrl: 'src/user/account/profile/vehicles/vehicles.html'
      });
  });