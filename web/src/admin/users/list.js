'use strict';

angular.module('app')
.config(function ($stateProvider) {
	$stateProvider
	.state('admin.users', {
		url: '/users',
		preserveQueryParams: true,
		page: {
			title: 'Users',
			class: 'icon-user',
			description: 'Manage all users'
		},
		controller: 'AdminUsersController',
		templateUrl: 'src/admin/users/list.html',
		menu: {
			name: 'Users',
			class: 'icon-user',
			tag: 'admin',
			priority: 5
		}
	});
});
