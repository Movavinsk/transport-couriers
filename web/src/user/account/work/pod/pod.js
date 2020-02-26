'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('user.account.work.pod', {
				url: '/{job_id}/pod',
				page: {
					title: 'My Work',
					class: 'icon-layers',
					description: 'My Work'
				},
				modal: 'lg',
				controller: 'UserWorkPodController',
				templateUrl: 'src/user/account/work/pod/pod.html'
			});
	});
