'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.jobs.bids.add', {
                url: '/new/{job_id}',
                page: {
                    title: 'Job Bids',
                    class: 'icon-layers',
                    description: 'Manage all bids for job'
                },
		        modal: 'lg',
                controller: 'AdminJobsBidsEditController',
                templateUrl: 'src/admin/jobs/bids/edit/edit.html'
            })
            .state('admin.jobs.bids.edit', {
                url: '/edit/{bid_id}',
                page: {
                    title: 'Job Bids',
                    class: 'icon-layers',
                    description: 'Manage all bids for job'
                },
		        modal: 'lg',
                controller: 'AdminJobsBidsEditController',
                templateUrl: 'src/admin/jobs/bids/edit/edit.html'
            });
    });
