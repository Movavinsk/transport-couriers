'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('user.jobs.browse.submit', {
		url: '/{job_id}/submit',
		page: {
			title: 'Browse Jobs',
			class: 'icon-magnifier',
			description: 'Browse all jobs'
		},
		modal: 'lg',
		controller: 'UserJobsBrowseSubmitController',
		templateUrl: 'src/user/jobs/browse/submit/submit.html'
	});
});
