'use strict';

angular.module('app').controller('UserTeamJobsController', function ($scope, $moment, $notifier, $location, $err, $auth, ngTableParams, $restUser) {

    $scope.loading = true;

    $scope.statuses = {
        'active': {
            name: 'Active',
            description: 'Waiting for bids'
        },
        'progress': {
            name: 'In Progress',
            description: 'Out for delivery'
        },
        'delivered': {
            name: 'Delivered',
            description: 'Out for delivery'
        },
        'invoice': {
            name: 'Invoiced',
            description: 'Invoice received'
        },
        'complete': {
            name: 'Completed',
            description: 'Job completed'
        },
        'cancel': {
            name: 'Cancelled',
            description: 'Job cancelled'
        },
        'expire': {
            name: 'Expired',
            description: 'Job expired'
        }
    };

    $scope.richStatuses = {};

    $auth.assure(function() {
        $scope.tableParams = new ngTableParams(
            angular.extend(
                {
                    page: 1,
                    count: 10,
                    sorting: {
                        created_at: 'desc'
                    }
                },
                $location.search()
            ),
            {
                total: 0,
                getData: function ($defer, params) {
                    $location.search(params.url());
                    $err.tryPromise($restUser.one('teams', $auth.user().team_id).all('jobs').getList(params.url())).then(function (result) {
                        $scope.richStatuses = result.properties.statuses;
                        $scope.tableParams.settings({total: result.paginator.total});
                        $defer.resolve(result);
                        $scope.loading = false;
                    });
                }
            }
        );
    });


    $scope.getJobStatus = function (job) {

        if (job.status == "invoice" && job.payment_received) {
            return "Paid";
        }

        return $scope.statuses[job.status].name;
    };

    $scope.getJobInfo = function (job) {

        if (job.status == "active" && job.bids_count > 0) {
            return "You have received bids";
        }

        if (job.status == "progress" && job.bid_manual) {
            return "Job allocated manually";
        }

        if ((job.status == "invoice") && !job.payment_received) {
            return "You have unpaid invoices"
        }

        if (job.status == "invoice" && job.payment_received) {
            return "Your payment has been received"
        }

        return $scope.statuses[job.status].description;
    };

    $scope.formSubmitted = false;

    $scope.complete = function (job) {
        $scope.formSubmitted = true;
        $err.tryPromise($restUser.one('jobs', job.id).get()).then(function (result) {
            result.completed = true;
            result.status = 'complete';
            result.status_date = $moment().format();
            $err.tryPromise(result.put()).then(function () {
                job.completed = true;
                job.status = 'complete';
                $notifier.success("Job completed successfully");
            });
        });
    }
});
