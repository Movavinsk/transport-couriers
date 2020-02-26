'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.jobs.bids', {
				url: '/{job_id}/bids',
				page: {
					title: 'My Jobs',
					class: 'icon-layers',
					description: 'My jobs'
				},
				modal: 'lg',
				controller: 'UserJobsBidsController',
				templateUrl: 'src/user/account/jobs/bids/bids.html'
			});
	});
