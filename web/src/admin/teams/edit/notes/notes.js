'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.teams.edit.addnote', {
                    url: '/notes',
                    page: {
                        title: 'Add note',
                        class: 'icon-envelope',
                        description: 'Add note'
                    },
                    modal: 'md',
                    controller: 'AdminTeamNotesEditController',
                    templateUrl: 'src/admin/teams/edit/notes/edit.html'
                })
            .state('admin.teams.edit.editnote', {
                url: '/notes/edit/{note_id}',
                page: {
                    title: 'Edit note',
                    class: 'icon-envelope',
                    description: 'Edit note'
                },
                modal: 'md',
                controller: 'AdminTeamNotesEditController',
                templateUrl: 'src/admin/teams/edit/notes/edit.html'
            });
    });