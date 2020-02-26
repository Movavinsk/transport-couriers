'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('user.account.jobs.notes', {
                url: '/{job_id}/notes',
                page: {
                    title: 'My Jobs',
                    class: 'icon-layers',
                    description: 'My jobs'
                },
                params: {
                    job_id: null,
                    notes: null,
                    bid_details: null,
                },
                modal: 'lg',
                controller: 'UserJobsNotesController',
                templateUrl: 'src/user/account/jobs/notes/notes.html'
            });
    });
