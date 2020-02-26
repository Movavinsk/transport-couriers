'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.work.invoice', {
				url: '/{job_id}/invoice',
				page: {
					title: 'My Work',
					class: 'icon-layers',
					description: 'My Work'
				},
				modal: 'lg',
				controller: 'UserWorkInvoiceController',
				templateUrl: 'src/user/account/work/invoice/invoice.html'
			});
	});
