'use strict';

angular.module('app')
	.config(function ($stateProvider) {
		$stateProvider
			.state('admin.settings', {
				abstract: true,
				url: '/settings',
				template: '<div data-ui-view></div>'
				//menu: {
				//	name: 'Settings',
				//	class: 'icon-settings',
				//	tag: 'admin',
				//	priority: 2
				//}
			});
	});
