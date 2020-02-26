'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('user.account.feedback.add', {
                url: '/feedback/add/{job_id}/{bid_id}',
                page: {
                    title: 'Add feedback',
                    class: 'icon-layers',
                    description: 'Add feedback'
                },
                modal: 'md',
                controller: 'UserFeedbackAddController',
                templateUrl: 'src/user/account/feedback/add/add.html'
            });
    });
