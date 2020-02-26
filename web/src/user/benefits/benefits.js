'use strict';

angular
  .module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.benefits', {
        url: '/benefits',
        preserveQueryParams: true,
        page: {
          title: 'SDCN User Benefits',
          name: 'doo',
          description: 'SDCN User Benefits'
        },
        controller: 'UserBenefitsController',
        templateUrl: 'src/user/benefits/benefits.html'
      })
    ;
  });