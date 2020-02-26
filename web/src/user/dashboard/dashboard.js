'use strict';

angular.module('app')
	.config(function($stateProvider) {
	  $stateProvider
		  .state('user.dashboard', {
			url: '/dashboard',
			page: {
			  title: 'Dashboard',
			  subTitle: 'User dashboard'
			},
      controller: 'UserDashboardController',
			templateUrl: 'src/user/dashboard/dashboard.html'
		  });
	});
