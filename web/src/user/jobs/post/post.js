'use strict';

/**
 * Add form for Post a single job
 */
angular.module('app')
.config(function($stateProvider) {
	$stateProvider
	.state('user.jobs.post', {
		url: '/post',
		page: {
			title: 'Post A Job',
			class: 'icon-doc',
			description: 'Post a new Job'
		},
		controller: 'UserJobsPostController',
		templateUrl: 'src/user/jobs/post/post.html',
		params: {
			repost_job: null
		}
	});
});
