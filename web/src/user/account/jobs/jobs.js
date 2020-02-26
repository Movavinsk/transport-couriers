'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('user.account.jobs', {
		url: '/jobs',
		preserveQueryParams: true,
		page: {
			title: 'My Jobs',
			description: 'My jobs'
		},
		controller: 'UserJobsController',
		templateUrl: 'src/user/account/jobs/jobs.html'
	});
});
