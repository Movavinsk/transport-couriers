'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account', {
        abstract: true,
        url: '/my',
        template: '<div data-ui-view></div>'
      })
    ;
  });
