'use strict';

angular.module('app').controller('UserJobsBrowseSubmitController', function ($q, $moment, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $auth) {

  if (!modalParams.job_id) return;

  $scope.formSubmited = false;
  $scope.loading = true;

  $scope.data = {};

  $scope.job_id = modalParams.job_id || null;

  $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
    $scope.job = data;

    $scope.job.avg_miles = $scope.getDistance(data);

    $auth.assure(function() {
      $scope.loading = false;

      $scope.data = {
        user_id: $auth.user().id,
        add_vat: $auth.user().team.invoice_details.invoice_including_vat,
        job_id: $scope.job_id,
        bid_date: $moment().format()
      };
    });
  });

  //Fallback statement to deny double bids
  var query = {
    filter: {
      job_id: $scope.job_id,
      user_id: $auth.user().id
    }
  };

  $err.tryPromise($restUser.all('bids').getList(flattenParams(query))).then(function (data) {
    if (data.length) {
      $notifier.error('Already submitted bid');
      $scope.$dismiss();
    }
  });

  $scope.store = function () {
    $scope.formSubmited = true;
    $err.tryPromise($restUser.all('bids').post($scope.data)).then(function () {
      $notifier.success('Bid submitted successfully');
      $app.goTo('user.account.work');
      $scope.$dismiss();
    }, function (error) {
      $scope.formSubmited = false;
    });
  };

  $scope.getDistance = function(job) {
    if (job) {
      if(job.distance) {
        return getMiles(job.distance);
      }else {
        return getMiles(google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude), new google.maps.LatLng(job.destination_latitude, job.destination_longitude)));
      }
    }
  }
});
