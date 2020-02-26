'use strict';

angular.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
				page: {
					title: 'Login'
				},
				templateUrl: 'src/login/login.html'
			})
		;
	});
