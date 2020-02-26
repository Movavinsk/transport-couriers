'use strict';

/**
 * Add form for Post a single job
 */
angular.module('app')
.config(function($stateProvider) {
	$stateProvider
	.state('user.jobs.edit', {
		url: '/edit/{job_id}',
		page: {
			title: 'Post A Job',
			class: 'icon-doc',
			description: 'Post a new Job'
		},
		controller: 'UserJobsEditController',
		templateUrl: 'src/user/jobs/edit/edit.html',
		params: {
			job: null,
			job_id: null
		}
	});
});
