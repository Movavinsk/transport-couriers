'use strict';

/**
 * Edit form for a Email settings
 */
angular.module('app')
.config(function($stateProvider) {
  $stateProvider
	.state('admin.settings.email', {
		url: '/email',
		page: {
			title: 'Email settings',
			class: 'icon-envelope',
			description: 'Update your outbound email settings like smtp server, username, password, etc'
		},
		controller: 'AdminSettingsEmailController',
		templateUrl: 'src/admin/settings/email/email.html'
		//menu: {
		//	name: 'Email settings',
		//	class: 'icon-envelope',
		//	tag: 'admin'
		//}
	});
});
