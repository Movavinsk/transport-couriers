'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
.config(function($stateProvider) {
	$stateProvider
	.state('admin.users.add', {
		url: '/new',
		page: {
			title: 'Users',
			class: 'icon-user',
			description: 'Manage all users'
		},
		controller: 'AdminUsersEditController',
		templateUrl: 'src/admin/users/edit/edit.html',
		menu: {
			name: 'User',
			class: 'icon-user',
			tag: 'action'
		}
	})
	.state('admin.users.edit', {
		url: '/edit/{id}',
		page: {
			title: 'Users',
			class: 'icon-user',
			description: 'Manage all users'
		},
		controller: 'AdminUsersEditController',
		templateUrl: 'src/admin/users/edit/edit.html'
	});
});
