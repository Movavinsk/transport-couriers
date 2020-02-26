'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.team.documents.add', {
        url: '/{team_id}/add',
        page: {
          title: 'Add Document',
          class: 'icon-envelope',
          description: 'Upload document'
        },
        modal: 'md',
        controller: 'TeamDocumentAddController',
        templateUrl: 'src/user/account/team/documents/add/add.html'
      });
  });
