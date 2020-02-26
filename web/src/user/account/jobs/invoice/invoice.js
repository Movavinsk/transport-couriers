'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.jobs.invoice', {
				url: '/{job_id}/invoice',
				page: {
					title: 'My Jobs',
					class: 'icon-layers',
					description: 'My jobs'
				},
				modal: 'lg',
				controller: 'UserJobsInvoiceController',
				templateUrl: 'src/user/account/jobs/invoice/invoice.html'
			});
	});
