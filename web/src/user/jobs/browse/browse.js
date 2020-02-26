'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('user.jobs.browse', {
		url: '/browse',
		preserveQueryParams: true,
		page: {
			title: 'Browse Jobs',
			class: 'icon-magnifier',
			description: 'Browse all jobs'
		},
		controller: 'UserJobsBrowseController',
		templateUrl: 'src/user/jobs/browse/browse.html'
	});
});
