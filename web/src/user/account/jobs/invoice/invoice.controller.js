'use strict';

angular.module('app')
.controller('UserJobsInvoiceController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment, $auth) {

	if( ! modalParams.job_id ) return;

	$scope.job_id = modalParams.job_id || null;
  $scope.loading = true;
  $scope.date = $moment().format();

  var query = {
    filter: {
      job_id: $scope.job_id
    }
  };

  $err.tryPromise($restUser.one('invoices').get(flattenParams(query))).then(function(data) {
    $scope.loading = false;
    var invoice = data[0];

    //  @NOTE this closes a security hole.
    //  check if the invoice is viewable by the user that's trying to view it
    //  @TODO this should be moved into the backend!
    if (invoice.job.bid.user.team_info.id === $auth.user().team_id || invoice.job.user_info.team_info.id == $auth.user().team_id ) {
      $scope.data = invoice;
    } else {
      $scope.data = null;
    }

  });

  $err.tryPromise($restUser.one('invoices').get(flattenParams({filter: {id: query.filter.job_id}}))).then(function(data) {
    var job = data[0];

    $scope.details = job.details;
  });

});
