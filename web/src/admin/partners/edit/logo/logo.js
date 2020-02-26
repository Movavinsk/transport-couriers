'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.partners.edit.logo', {
        url: '/logo',
        page: {
          title: 'Manage Partner Logo',
          class: 'icon-envelope',
          description: 'Add/Edit Partner Logo'
        },
        modal: 'lg',
        controller: 'PartnerLogoController',
        templateUrl: 'src/admin/partners/edit/logo/logo.html'
      });
  });
