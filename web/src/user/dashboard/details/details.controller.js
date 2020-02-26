'use strict';

angular.module('app')
  .controller('UserDashboardDetailsController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, uiGmapIsReady) {

    if (!modalParams.job_id) return;

    $scope.loading = true;

    $scope.job_id = modalParams.job_id || null;

    $scope.formSubmitted = false;

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (data) {
      $scope.loading = false;
      $scope.data = data;

      $scope.map = {
        center: {
          latitude: $scope.data.pickup_latitude,
          longitude: $scope.data.pickup_longitude
        },
        zoom: 9,
        bounds: {},
        polyLines: [],
        control: {},
        options: {scrollwheel: false}
      };

      $scope.setMapDirections(data);
    });

    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();

    $scope.setMapDirections = function(job) {
      uiGmapIsReady.promise(1)
        .then(function(instances) {

          var instanceMap = instances[0].map;

          $scope.directionsDisplay.setMap(instanceMap);

          var directionsServiceRequest = {
            origin: new google.maps.LatLng(
              job.pickup_latitude,
              job.pickup_longitude
            ),
            destination: new google.maps.LatLng(
              job.destination_latitude,
              job.destination_longitude
            ),
            travelMode: google.maps.TravelMode['DRIVING'],
            optimizeWaypoints: true
          };

          $scope.directionsService.route(directionsServiceRequest, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              $scope.directionsDisplay.setDirections(response);

              job.distance = response.routes[0].legs[0].distance.value;
              job.duration = response.routes[0].legs[0].duration.text;
              var drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
            }
          });
        });
    }

    $scope.$destroy = function() {
      delete $scope.directionsDisplay;
      delete $scope.directionsService;
    }

  });
