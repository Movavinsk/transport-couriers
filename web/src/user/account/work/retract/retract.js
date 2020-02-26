'use strict';

angular.module('app')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user.account.work.retract', {
        url: '/{bid_id}/retract',
        page: {
          title: 'Retract Bid',
          class: 'icon-layers',
          description: 'Retract Bid'
        },
        modal: 'md',
        controller: 'UserWorkRetractController',
        templateUrl: 'src/user/account/work/retract/retract.html'
      });
  });
