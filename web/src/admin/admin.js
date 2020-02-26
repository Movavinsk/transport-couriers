'use strict';

angular.module('app')
	.config(function($stateProvider) {
		$stateProvider
			.state('admin', {
				abstract: true,
				url: '/admin',
				templateUrl: 'src/admin/admin.html'
			})
		;
	});
