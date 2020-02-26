'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.teams', {
                url: '/teams',
                preserveQueryParams: true,
                page: {
                    title: 'Members',
                    class: 'icon-user',
                    description: 'Manage all members'
                },
                controller: 'AdminTeamsController',
                templateUrl: 'src/admin/teams/list.html',
                menu: {
                    name: 'Members',
                    class: 'icon-users',
                    tag: 'admin',
                    priority: 3
                }
            });
    });
