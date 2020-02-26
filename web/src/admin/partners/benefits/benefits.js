'use strict';

angular
    .module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.partners.edit.benefits', {
                url: '/benefits',
                preserveQueryParams: true,
                page: {
                    title: 'Benefits',
                    class: 'fa fa-heart',
                    description: 'Manage Benefits'
                },
            });
    });
