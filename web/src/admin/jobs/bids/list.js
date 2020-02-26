'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.jobs.bids', {
                url: '/{id}/bids',
                preserveQueryParams: true,
                page: {
                    title: 'Job Bids',
                    class: 'icon-layers',
                    description: 'Manage all bids for job'
                },
                controller: 'AdminJobBidsController',
                templateUrl: 'src/admin/jobs/bids/list.html'
            });
    });
