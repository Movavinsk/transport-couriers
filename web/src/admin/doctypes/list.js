'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.doctypes', {
                url: '/doctypes',
                preserveQueryParams: true,
                page: {
                    title: 'Document Types',
                    class: 'icon-doc',
                    description: 'Manage the document types'
                },
                controller: 'AdminDocumentTypesController',
                templateUrl: 'src/admin/doctypes/list.html',
                menu: {
                    name: 'Document Types',
                    class: 'icon-doc',
                    tag: 'admin',
                    priority: 3
                }
            });
    });
