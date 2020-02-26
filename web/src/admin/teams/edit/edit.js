'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.teams.add', {
                url: '/new',
                page: {
                    title: 'Members',
                    class: 'icon-user',
                    description: 'Manage all members'
                },
                controller: 'AdminTeamsEditController',
                templateUrl: 'src/admin/teams/edit/edit.html',
                menu: {
                    name: 'Members',
                    class: 'icon-users',
                    tag: 'action'
                }
            })
            .state('admin.teams.edit', {
                url: '/edit/{id}',
                page: {
                    title: 'Members',
                    class: 'icon-user',
                    description: 'Manage all members'
                },
                controller: 'AdminTeamsEditController',
                templateUrl: 'src/admin/teams/edit/edit.html'
            })
    });
