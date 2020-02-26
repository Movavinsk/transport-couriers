'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.directory.map', {
        url: '/map/:lat/:lng/:radius',
        page: {
          title: 'User Location',
          class: 'icon-envelope',
          description: 'User Location'
        },
        modal: 'lg',
        controller: 'DirectoryLocationController',
        templateUrl: 'src/user/directory/map/map.html'
      });
  });
