'use strict';

angular
  .module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.directory', {
        url: '/directory',
        preserveQueryParams: true,
        page: {
          title: 'Members Directory',
          description: 'SDCN Members Directory'
        },
        controller: 'UserMembersDirectoryController',
        templateUrl: 'src/user/directory/directory.html'
      })
    ;
  });