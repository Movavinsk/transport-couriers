'use strict';

angular.module('app')
	.config(function ($stateProvider) {
	  $stateProvider
		  .state('login.reset', {
			url: '/reset/{token}',
			page: {
				title: 'Reset password'
			},
			templateUrl: 'src/login/reset/reset.html',
			controller: 'ResetController'
		  });
	});
