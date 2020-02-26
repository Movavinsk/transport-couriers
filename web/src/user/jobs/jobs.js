'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('user.jobs', {
            abstract: true,
            url: '/jobs',
            template: '<div data-ui-view></div>'
	});
});
