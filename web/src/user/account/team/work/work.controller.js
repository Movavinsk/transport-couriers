'use strict';

angular.module('app').controller('UserTeamWorkController', function ($rootScope, $notifier, $state, $scope, $q, $location, $moment, $filter, $err, ngTableParams, $restUser) {

  $scope.loading = true;

  $scope.formSubmitted = false;

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
    ), {
      total: 0,
      getData: function ($defer, params) {
        $location.search(params.url());
        $err.tryPromise($restUser.one('team').all('work').getList(params.url())).then(function (result) {
          $scope.tableParams.settings({total: result.paginator.total});
          $defer.resolve(result);
          $scope.loading = false;
        });
      }
    });

  $scope.getJobStatus = function(job) {

    if(job.status == "invoice" && job.payment_received) {
      return "Paid";
    }

    return $scope.statuses[job.status].name;
  }

  $scope.getJobInfo = function(job) {

    if(job.status == "active" && job.team_bid) {
      return "Bid pending";
    }

    if(job.status == "progress" && job.bid_manual) {
      return "Job allocated manually";
    }

    if((job.status == "invoice") && !job.payment_received) {
      return "You have unpaid invoices"
    }

    if(job.status == "invoice" && job.payment_received) {
      return "Payment has been received"
    }

    return $scope.statuses[job.status].description;
  }

  $scope.complete = function (job) {
    job.completed = true;
    $err.tryPromise($restUser.one('jobs', job.id).get()).then(function (data) {
      data.status = 'complete';
      data.status_date = $moment().format();
      $err.tryPromise(data.put()).then(function () {
        $notifier.success("Job completed successfully");
        job.status = 'complete';
        job.status_date = data.status_date;
      });
    });
  };

  $scope.paid = function(job) {
    $err.tryPromise($restUser.one('jobs', job.id).get()).then(function (result) {
      job.payment_received = true;
      result.payment_received = true;
      result.put();
    });
  }
});
