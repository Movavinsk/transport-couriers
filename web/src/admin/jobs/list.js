'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.jobs', {
                url: '/jobs',
                preserveQueryParams: true,
                page: {
                    title: 'Jobs',
                    class: 'icon-layers',
                    description: 'Manage all jobs'
                },
                controller: 'AdminJobsController',
                templateUrl: 'src/admin/jobs/list.html',
                menu: {
                    name: 'Jobs',
                    class: 'icon-layers',
                    tag: 'admin',
                    priority: 9
                }
            });
    });
