'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.jobs.add', {
                url: '/new',
                page: {
                    title: 'Jobs',
                    class: 'icon-layers',
                    description: 'Manage all jobs'
                },
                controller: 'AdminJobsEditController',
                templateUrl: 'src/admin/jobs/edit/edit.html',
                menu: {
                    name: 'Job',
                    class: 'icon-layers',
                    tag: 'action'
                },
                params: {
                    repost_job: null
                }
            })
            .state('admin.jobs.edit', {
                url: '/edit/{id}',
                page: {
                    title: 'Jobs',
                    class: 'icon-layers',
                    description: 'Manage all jobs'
                },
                controller: 'AdminJobsEditController',
                templateUrl: 'src/admin/jobs/edit/edit.html',
                params: {
                    edit_job: null
                }
            });
    });
