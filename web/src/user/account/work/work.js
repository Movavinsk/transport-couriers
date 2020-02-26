'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
		.state('user.account.work', {
			url: '/work',
			page: {
				title: 'My Work',
				class: 'icon-layers',
				description: 'My Work'
			},
			controller: 'UserWorkController',
			templateUrl: 'src/user/account/work/work.html'
		});
});
