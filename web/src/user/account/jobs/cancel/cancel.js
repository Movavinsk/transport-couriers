'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.jobs.cancel', {
				url: '/{job_id}/cancel',
				page: {
					title: 'My Jobs',
					class: 'icon-layers',
					description: 'My jobs'
				},
				modal: 'lg',
				controller: 'UserJobsCancelController',
				templateUrl: 'src/user/account/jobs/cancel/cancel.html'
			});
	});
