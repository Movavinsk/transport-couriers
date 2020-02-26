'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('user.account.team.jobs', {
		url: '/jobs',
		preserveQueryParams: true,
		page: {
			title: 'Our jobs'
		},
		controller: 'UserTeamJobsController',
		templateUrl: 'src/user/account/team/jobs/jobs.html'
	});
});
