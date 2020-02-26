'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.jobs.bids.confirm', {
				url: '/{bid_id}/confirm',
				page: {
					title: 'My Jobs',
					class: 'icon-layers',
					description: 'My jobs'
				},
				modal: 'lg',
				controller: 'UserJobsBidsConfirmController',
				templateUrl: 'src/user/account/jobs/bids/confirm/confirm.html'
			});
	});
