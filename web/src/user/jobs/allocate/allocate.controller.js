'use strict';

angular.module('app').controller('UserJobsAllocateController', function ($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {

  function getDefaultDate(plus, reset) {
    var time = $moment();

    if (reset) {
      time.hour(8).minute(0).second(0);
    }

    time.add(plus, "d");
    return time.toDate();
  }

  // Helps exchanging dates with Carbon
  var dateFormat = 'YYYY-MM-DD HH:mm:ss';

  $scope.formSubmited = false;

  $scope.minDate = $moment().toDate();

  $scope.data = {
    user_id: $auth.user().id,
    priority: 3,
    pickup_date: getDefaultDate(0),
    destination_date: getDefaultDate(1, true),
    expiry_time: $moment().add(1, "d").toDate(),
    additional_options: [],
    way_points: [],
    pickup_postcode_prefix: "",
    pickup_town: "",
    destination_postcode_prefix: "",
    destination_town: "",
    allocate_manually: false,
    bid_manual: 1,
    bid_user_id: $auth.user().id,
    bid_amount: 0,
    bid_add_vat: 0
  };

  $scope.$watch("data.pickup_details", function(newVal){
    if(newVal){
      newVal.address_components.forEach(function(address_component){
        address_component.types.forEach(function(type){
          if (type == "postal_town"){
            $scope.data.pickup_town = address_component.long_name
          }
        })
        if($scope.data.pickup_town == ""){
          address_component.types.forEach(function(type){
            if (type == "locality"){
              $scope.data.pickup_town = address_component.long_name
            }
          })
        }
      })
      newVal.address_components.forEach(function(address_component){
        address_component.types.forEach(function(type){
          if (type == "postal_code"){
            $scope.data.pickup_postcode_prefix = address_component.long_name.split(" ")[0]
          }
        })
      })
      $scope.data.pickup_formatted_address = newVal.formatted_address;
    }
  })

  $scope.$watch("data.destination_details", function(newVal){
    if(newVal){
      newVal.address_components.forEach(function(address_component){
        address_component.types.forEach(function(type){
          if (type == "postal_town"){
            $scope.data.destination_town = address_component.long_name
          }
        })
        if($scope.data.destination_town == ""){
          address_component.types.forEach(function(type){
            if (type == "locality"){
              $scope.data.destination_town = address_component.long_name
            }
          })
        }
      })
      newVal.address_components.forEach(function(address_component){
        address_component.types.forEach(function(type){
          if (type == "postal_code"){
            $scope.data.destination_postcode_prefix = address_component.long_name.split(" ")[0]
          }
        })
      });
      $scope.data.destination_formatted_address = newVal.formatted_address;
    }
  })

  $scope.setUserId = function($item, $model) {
    $scope.data.bid_user_id = $model.id;
    $scope.data.bid_add_vat = $model.team.invoice_details.invoice_including_vat;
  }

  $scope.getUsers = function(value) {
    return $restUser.all('user').getList(flattenParams({filters: {search: value, inactivated: 0}})).then(function (result) {
      return result.plain();
    });
  }

  $scope.$watch(function () {
    return $auth.user().id;
  }, function (newVal) {
    $scope.data.user_id = newVal;
  });

  $err.tryPromise($restApp.all('options').getList())
    .then(function(data) {
      $scope.vehicle_options = data;
    });

  $scope.toggleSelection = function(option) {
    var idx = $scope.data.additional_options.indexOf(option);

    if (idx > -1) {
      $scope.data.additional_options.splice(idx, 1);
    } else {
      $scope.data.additional_options.push(option)
    }
  }

  $err.tryPromise($restApp.all('vehicles').getList({'sorting[size]': "asc", count: -1})).then(function(data) {
  // $err.tryPromise($restApp.all('vehicles').getList(flattenParams({'count' : -1}))).then(function(data) {
    $scope.vehicles = data;
  });
  $scope.user = $auth.user();

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

  $scope.store = function () {

    if ($scope.data.pickup_latitude == undefined || $scope.data.destination_latitude == undefined){
      $notifier.error("Location not registered. Please select locations from the dropdown.");
      return;
    }

    var pickup_date = $scope.data.pickup_date;
    var destination_date = $scope.data.destination_date
    var expiry_time = $scope.data.expiry_time;
    var pickup_date_end = $scope.data.pickup_date_end;
    var destination_date_end = $scope.data.destination_date_end;

    $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
    $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
    $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
    $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
    $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
    $scope.formSubmited = true;
    $scope.data.status = 'progress';
    $scope.data.status_date = getDefaultDate();
    $err.tryPromise($restUser.all('jobs').post($scope.data)).then(function () {
      $notifier.success('Job posted successfully');
      $app.goTo('user.account.jobs');
    }, function (error) {
      
      $scope.data.pickup_date = pickup_date;
      $scope.data.destination_date = destination_date;
      $scope.data.expiry_time = expiry_time;
      $scope.data.pickup_date_end = pickup_date_end;
      $scope.data.destination_date_end = destination_date_end;

      $scope.formSubmited = false;
    });
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
});
