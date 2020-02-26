'use strict';

angular.module('app').controller('UserJobsBrowseController', function ($rootScope, $state, $scope, $q, $location, $filter, $err, ngTableParams, $restApp, $restUser, $modal, $log, $geo, uiGmapIsReady, $auth) {

  $scope.loading = true;

  $scope.filters = {};

  $scope.user = $auth.user();

  $scope.filterByPickup = 'filter[pickup_address]' in $location.$$search ? true : false;
  $scope.filterByDest = 'filter[destination_address]' in $location.$$search ? true : false;
  $scope.filters.pickup_miles = 'filter[pickup_miles]' in $location.$$search ? parseInt($location.$$search['filter[pickup_miles]']) : 0;
  $scope.filters.destination_miles = 'filter[destination_miles]' in $location.$$search ? parseInt($location.$$search['filter[destination_miles]']) : 0;
  $scope.vehicles = $restApp.all('vehicles').customGETLIST('select').$object;

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
        $err.tryPromise($restUser.all('jobs').all('browse').getList(params.url())).then(function (result) {
          $scope.tableParams.settings({total: result.paginator.total});
          $scope.loading = false;
          $defer.resolve(result);
        }, function(result){
          if (result.status == 403){
            $scope.error = {
              status: 403,
              message: "Please check that your documents are correct and in date before searching for jobs."
            }
          }
          $scope.loading = false;
        });
      }
    });

  $scope.$watch('filterByPickup', function(newVal) {
    if(!newVal) {
      $scope.filters.pickup_miles = 0;
      delete $scope.tableParams.filter()['pickup_address'];
      delete $scope.tableParams.filter()['pickup_longitude'];
      delete $scope.tableParams.filter()['pickup_latitude'];
    }
  });

  $scope.setMapDirections = function(job) {
    uiGmapIsReady.promise(1)
      .then(function(instances) {

        var instanceMap = instances[0].map;

        job.map.directionsDisplay.setMap(instanceMap);

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

        job.map.directionsService.route(directionsServiceRequest, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            job.map.directionsDisplay.setDirections(response);

            job.distance = response.routes[0].legs[0].distance.value;
            job.duration = response.routes[0].legs[0].duration.text;
            var drivingDistance = getMiles(response.routes[0].legs[0].distance.value);
          }
        });
      });
  }

  $scope.maps = new Array();

  $scope.initMap = function(job) {

    $scope.tableParams.data.forEach(function(item) {
      if (item.isCollapsed === false && item.id !== job.id) {
        item.isCollapsed = true;
      }
    })

    job.map = {
      center: {
        latitude: job.pickup_latitude,
        longitude: job.pickup_longitude
      },
      zoom: 7,
      bounds: {},
      polyLines: [],
      control: {},
      options: {scrollwheel: false}
    };

    job.map.directionsService = new google.maps.DirectionsService();
    job.map.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#FF0000",
          strokeOpacity: 0.6
        }
    });

    $scope.maps[job.id] = job.map;

    setTimeout(
      function(){

        var pickup_latlng = new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude);
        var destination_latlng = new google.maps.LatLng(job.destination_latitude, job.destination_longitude);

        var bounds = new google.maps.LatLngBounds()

        var map = $scope.maps[job.id].control.getGMap();

        var Marker_A = new google.maps.Marker({
          position: pickup_latlng,
          label: "A",
          map: map,
          opacity: 0
        });

        var Marker_B = new google.maps.Marker({
          position: destination_latlng,
          label: "B",
          map: map,
          opacity: 0
        });

        bounds.extend(Marker_A.getPosition())
        bounds.extend(Marker_B.getPosition())

        map.fitBounds(bounds);

        var Circle_A = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: '#FF0000',
          fillOpacity: 1,
          map: map,
          center: pickup_latlng,
          radius: 1000
        });

        var Circle_B = new google.maps.Circle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: '#FF0000',
          fillOpacity: 1,
          map: map,
          center: destination_latlng,
          radius: 1000
        });

        $scope.maps[job.id].control.refresh();
    }, 100)

    //$scope.maps[job.id].control.refresh();

    $scope.setMapDirections(job);

  }

  $scope.$watch('filterByDest', function(newVal) {
    if(!newVal) {
      $scope.filters.destination_miles = 0;
      delete $scope.tableParams.filter()['destination_address'];
      delete $scope.tableParams.filter()['destination_longitude'];
      delete $scope.tableParams.filter()['destination_latitude'];
    }
  });

  $scope.$watch('filters.pickup_miles', function(value) {
    if(value > 0) $scope.tableParams.filter()['pickup_miles'] = value; else delete $scope.tableParams.filter()['pickup_miles'];
  });

  $scope.$watch('filters.destination_miles', function(value) {
    if(value > 0) $scope.tableParams.filter()['destination_miles'] = value; else delete $scope.tableParams.filter()['destination_miles'];
  });

  $scope.getDistance = function(job) {
    if(job.distance) {
      return getMiles(job.distance);
    }else {
      return getMiles(google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(job.pickup_latitude, job.pickup_longitude), new google.maps.LatLng(job.destination_latitude, job.destination_longitude)));
    }
  };

  $scope.getDate = function(date){
    return window.moment(date).format("YYYY/MM/DD h:mma")
  };

  $scope.call = function(data){
      window.location.href = "tel://"+ data;
  };
});