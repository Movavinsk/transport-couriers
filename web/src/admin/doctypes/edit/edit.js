'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.doctypes.add', {
                url: '/new',
                page: {
                    title: 'DocumentTypes',
                    class: 'icon-doc',
                    description: 'Manage the document types'
                },
                controller: 'AdminDocumentTypesEditController',
                templateUrl: 'src/admin/doctypes/edit/edit.html',
                menu: {
                    name: 'Document Type',
                    class: 'icon-doc',
                    tag: 'action'
                }
            })
            .state('admin.doctypes.edit', {
                url: '/edit/{id}',
                page: {
                    title: 'DocumentTypes',
                    class: 'icon-doc',
                    description: 'Manage the document types'
                },
                controller: 'AdminDocumentTypesEditController',
                templateUrl: 'src/admin/doctypes/edit/edit.html'
            });
    });
