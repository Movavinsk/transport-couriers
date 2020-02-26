'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.users.edit.adddocument', {
        url: '/documents/add',
        page: {
          title: 'Add Document',
          class: 'icon-envelope',
          description: 'Upload document'
        },
        modal: 'md',
        controller: 'AdminAddDocumentController',
        templateUrl: 'src/admin/users/edit/document/document.html'
      })
      .state('admin.users.edit.editdocument', {
          url: '/edit/{document_id}',
          page: {
              title: 'Edit Document',
              class: 'icon-pencil',
              description: 'Edit Document'
          },
          modal: 'md',
          controller: 'AdminAddDocumentController',
          templateUrl: 'src/admin/users/edit/document/document.html'
      });
  });
