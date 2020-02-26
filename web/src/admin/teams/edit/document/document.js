'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.teams.edit.adddocument', {
        url: '/documents/add',
        page: {
          title: 'Add Document',
          class: 'icon-envelope',
          description: 'Upload document'
        },
        modal: 'md',
        controller: 'AdminAddTeamDocumentController',
        templateUrl: 'src/admin/teams/edit/document/document.html'
      })
      .state('admin.teams.edit.editdocument', {
          url: '/edit/{document_id}',
          page: {
              title: 'Edit Document',
              class: 'icon-pencil',
              description: 'Edit Document'
          },
          modal: 'md',
          controller: 'AdminAddTeamDocumentController',
          templateUrl: 'src/admin/teams/edit/document/document.html'
      });
  });