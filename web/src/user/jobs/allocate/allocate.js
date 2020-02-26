'use strict';

/**
 * Add form for Post a single job
 */
angular.module('app')
.config(function($stateProvider) {
	$stateProvider
	.state('user.jobs.allocate', {
		url: '/allocate',
		page: {
			title: 'Allocate a Job',
			class: 'icon-doc',
			description: 'Allocate a new Job'
		},
		controller: 'UserJobsAllocateController',
		templateUrl: 'src/user/jobs/allocate/allocate.html'
	});
});
