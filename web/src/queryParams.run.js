'use strict';

angular.module('app')
.run(function($rootScope, $location) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if(fromState.preserveQueryParams) { //preserve the query params when fromState supports it
      fromState.queryParams = angular.copy($location.search());
    }
  });
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if((!!toState.preserveQueryParams) && angular.isDefined(toState.queryParams)) {
      $location.search(toState.queryParams);
      delete toState.queryParams;
    }
  });
});
