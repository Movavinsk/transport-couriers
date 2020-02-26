'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('user.account.team.edit', {
                url: '/edit',
                preserveQueryParams: true,
                page: {
                    title: 'Edit Team',
                    class: 'icon-layers',
                    description: 'Edit Team'
                },
                controller: 'UserTeamEditController',
                templateUrl: 'src/user/account/team/edit/edit.html',
                primaryTeamMember: true
            });
    });
