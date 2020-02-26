'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.jobs.manual', {
				url: '/{job_id}/manual',
				page: {
					title: 'My Jobs',
					class: 'icon-layers',
					description: 'My jobs'
				},
				modal: 'lg',
				controller: 'UserJobsManualController',
				templateUrl: 'src/user/account/jobs/manual/manual.html'
			});
	});
