'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.profile.documents', {
        url: '/documents',
        page: {
          title: 'Documents',
          class: 'icon-layers',
          description: 'Documents'
        },
        controller: 'UserProfileDocumentsController',
        templateUrl: 'src/user/account/profile/documents/documents.html'
      });
  });