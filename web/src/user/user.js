'use strict';

angular.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('user', {
				abstract: true,
				url: '/user',
				templateUrl: 'src/user/user.html'
			})
		;
	});
