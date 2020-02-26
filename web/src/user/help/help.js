'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.help', {
        url: '/help',
        page: {
          title: 'Help',
          subTitle: 'Help page description'
        },
        //controller: 'UserHelpController',
        templateUrl: 'src/user/help/help.html'
      });
  });
