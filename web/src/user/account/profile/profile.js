'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.profile', {
        url: '/profile?user_id',
        page: {
          title: 'Profile settings',
          description: 'Update your profile informations'
        },
        controller: 'UserProfileController',
        templateUrl: 'src/user/account/profile/profile.html'
      })
    ;
  });
