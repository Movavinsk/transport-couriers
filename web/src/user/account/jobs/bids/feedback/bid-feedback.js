'use strict';

angular
    .module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('user.account.jobs.bids.feedback', {
                url: '{team_id}/feedback',
                page: {
                    title: 'User Feedback',
                    class: 'icon-user',
                    description: 'User Feedback'
                },
                modal: 'lg',
                controller: 'UserBidFeedbackController',
                templateUrl: 'src/user/account/jobs/bids/feedback/feedback.html'
            });
    });

