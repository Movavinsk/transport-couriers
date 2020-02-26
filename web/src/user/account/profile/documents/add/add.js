'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.profile.documents.add', {
        url: '/{user_id}/add',
        page: {
          title: 'Add Document',
          class: 'icon-envelope',
          description: 'Upload document'
        },
        modal: 'md',
        controller: 'UserProfileDocumentController',
        templateUrl: 'src/user/account/profile/documents/add/add.html'
      });
  });
