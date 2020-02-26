'use strict';

angular.module('app')
  .controller('UserJobsEditController', function ($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {

    $scope.data = $stateParams.job;

    if ($stateParams.job.additional_options == null){
      $scope.data.additional_options = [];
    }

    $scope.user = $auth.user();

    var dateFormat = 'YYYY-MM-DD HH:mm:ss';

    function getDefaultDate(plus, reset) {
      var time = $moment();

      if (reset) {
        time.hour(8).minute(0).second(0);
      }

      time.add(plus, "d");
      return time.toDate();
    }

    $scope.minDate = $moment().toDate();

    $scope.toggleSelection = function(option) {
      var idx = $scope.data.additional_options.indexOf(option);

      if (idx > -1) {
        $scope.data.additional_options.splice(idx, 1);
      } else {
        $scope.data.additional_options.push(option)
      }
    }

    $scope.addToWayPoints = function () {
      $scope.data.way_points.push({
        way_point: null,
        stopoff_date: new Date()
      });
    };

    $scope.removeFromWayPoints = function (wayPoint) {
      var i = $scope.data.way_points.indexOf(wayPoint);
      if (i != -1) {
        $scope.data.way_points.splice(i, 1);
      }
    };

    $scope.cancel = function () {
      $app.reload();
    };

    $scope.$watch("data.accept_phone", function (newVal) {
      if (newVal) $scope.data.phone = $scope.user.phone;
      if (!newVal) delete $scope.data.phone;
    });

    $scope.$watch("data.accept_email", function (newVal) {
      if (newVal) $scope.data.email = $scope.user.email;
      if (!newVal) delete $scope.data.email;
    });

    $scope.$watch("data.flexible_pickup", function(newVal) {
        if (newVal) {
          $scope.data.pickup_date_end = $scope.data.pickup_date;
        }
    })

    $scope.$watch("data.flexible_destination", function(newVal) {
      if (newVal) {
        $scope.data.destination_date_end = $scope.data.destination_date;
      }
    })

    $scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();

    $scope.map = {
      center: {
        latitude: 51.5073509,
        longitude: -0.12775829999998223
      },
      zoom: 10,
      bounds: {},
      polyLines: []
    };

    $scope.mapOptions = {scrollwheel: false};

    $scope.$watch("data.pickup_latitude", function (newVal) {
      if(newVal && $scope.data.destination_latitude) {
        $scope.setMapDirections();
      };
    });

    $scope.$watch("data.destination_latitude", function (newVal) {
      if(newVal && $scope.data.pickup_latitude) {
        $scope.setMapDirections();
      };
    });

    $scope.setMapDirections = function() {
      uiGmapIsReady.promise()
        .then( function(instances) {
          var instanceMap = instances[0].map;

          $scope.directionsDisplay.setMap(instanceMap);

          var directionsServiceRequest = {
            origin: new google.maps.LatLng(
              $scope.data.pickup_latitude,
              $scope.data.pickup_longitude
            ),
            destination: new google.maps.LatLng(
              $scope.data.destination_latitude,
              $scope.data.destination_longitude
            ),
            travelMode: google.maps.TravelMode['DRIVING'],
            optimizeWaypoints: true
          };

          $scope.directionsService.route(directionsServiceRequest, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              $scope.directionsDisplay.setDirections(response);

              $scope.data.distance = response.routes[0].legs[0].distance.value;
              $scope.data.duration = response.routes[0].legs[0].duration.text;
              $scope.drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
            }
          });
        });
    }

    $err.tryPromise($restApp.all('options').getList())
      .then(function(data) {
        $scope.vehicle_options = data;
      });
    $err.tryPromise($restApp.all('vehicles').getList({'sorting[size]': "asc", count: -1})).then(function(data) {
      // $err.tryPromise($restApp.all('vehicles').getList(flattenParams({'count' : -1}))).then(function(data) {
        $scope.vehicles = data;
      });

    $scope.update = function(){
      $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
      $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
      $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
      $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
      $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
      $scope.formSubmited = true;


      $err.tryPromise($restUser.one('jobs', $scope.data.id).patch($scope.data)).then(function () {
        $notifier.success('Job updated successfully');
        $app.goTo('user.account.jobs');
      }, function (error) {
        $scope.formSubmited = false;
      });
    }

  });
