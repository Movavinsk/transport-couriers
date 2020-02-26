'use strict';

angular
    .module('app')
    .controller('UserBidFeedbackController', UserBidFeedbackController);

UserBidFeedbackController.$inject = ['$restUser', 'ngTableParams', '$scope', 'modalParams', '$err'];

function UserBidFeedbackController($restUser, ngTableParams, $scope, modalParams, $err) {

    if (! modalParams.team_id || ! modalParams.job_id ) return;

    $scope.team_id = modalParams.team_id;

    // we only use job id to go back to bids
    $scope.job_id = modalParams.job_id;

    // $scope.bid_id = modalParams.bid_id;

    // $restUser.all('bids').getList(flattenParams({filter: {job_id: $scope.job_id, id: $scope.bid_id}}))
    //     .then(function (data) {
    //         $scope.bid = data[0];
    //     });

    // $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
    //   $scope.job = data;
    // });

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            created_at: 'desc'
        }
        }, {
        total: 0,
        getData: function ($defer, params) {
            $restUser.one('team-feedback', $scope.team_id).get()
                .then(function(result) {
                    $scope.team = result;
                    $scope.tableParams.settings({total: result.feedback.length});
                    $defer.resolve(result.feedback);
                });
        }
    });


}

