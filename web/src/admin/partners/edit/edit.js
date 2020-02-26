'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.partners.add', {
                url: '/new',
                page: {
                    title: 'Att a Partner',
                    class: 'fa fa-user',
                    description: 'Manage Partners'
                },
                controller: 'AdminPartnersEditController',
                templateUrl: 'src/admin/partners/edit/edit.html',
                menu: {
                    name: 'Partner',
                    class: 'fa fa-user',
                    tag: 'action'
                }
            })
            .state('admin.partners.edit', {
                url: '/edit/{partner_id}',
                page: {
                    title: 'Edit Partner',
                    class: 'fa fa-user',
                    description: 'Manage Partners'
                },
                controller: 'AdminPartnersEditController',
                templateUrl: 'src/admin/partners/edit/edit.html'
            });
    });
