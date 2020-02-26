'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.profile.avatar', {
        url: '/{user_id}/avatar',
        page: {
          title: 'Manage Avatar',
          class: 'icon-envelope',
          description: 'Add/Edit avatar image'
        },
        modal: 'lg',
        controller: 'UserAvatarController',
        templateUrl: 'src/user/account/profile/avatar/avatar.html'
      });
  });
