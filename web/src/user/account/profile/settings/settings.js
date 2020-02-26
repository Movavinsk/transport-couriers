'use strict';

angular.module('app')
  .config(function ($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('user.account.profile.notifications', {
        url: '/notifications',
        page: {
          title: 'Notifications',
          class: 'icon-layers',
          description: 'Vehicles'
        },
        controller: 'UserProfileSettingsController',
        templateUrl: 'src/user/account/profile/settings/settings.html'
      });
  });