'use strict';

angular
    .module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.partners', {
                url: '/partners',
                preserveQueryParams: true,
                page: {
                    title: 'Partners',
                    class: 'fa fa-user',
                    description: 'Manage Partners'
                },
                controller: 'AdminPartnersController',
                templateUrl: 'src/admin/partners/partners.html',
                menu: {
                    name: 'Partners',
                    class: 'fa fa-user',
                    tag: 'admin',
                    priority: 4
                }
            });
    });
