'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.documents', {
        url: '/documents',
        page: {
          title: 'Add Document',
          class: 'icon-envelope',
          description: ''
        },
        controller: 'TeamDocumentController',
        templateUrl: 'src/user/account/team/documents/document.html'
      });
  });
