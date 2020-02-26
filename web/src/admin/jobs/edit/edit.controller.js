'use strict';

angular.module('app').controller('AdminJobsEditController', function ($q, $scope, $filter, $state, $stateParams, $restUser, $restApp, $auth, $notifier, $app, $err, $geo, $moment, uiGmapGoogleMapApi, uiGmapIsReady) {

    $scope.mode = 'Loading...';

    $scope.type = function(){
        if ($stateParams.repost_job != null){
            return 'repost';
        }
        if ($stateParams.edit_job != null){
            return 'edit';
        }
        return 'new';
    }

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
        user_id: '',
        priority: 3,
        pickup_date: getDefaultDate(0),
        destination_date: getDefaultDate(1, true),
        expiry_time: $moment().add(1, "d").toDate(),
        additional_options: [],
        way_points: [],
        pickup_postcode_prefix: "",
        pickup_town: "",
        destination_postcode_prefix: "",
        destination_town: ""
    };

    const getAddressComponents = function(newVal, town, postcode, address){
        if (!newVal) return;
        newVal.address_components.forEach(function(address_component){
            address_component.types.forEach(function(type){
                if (type == "postal_town"){
                    $scope.data[town] = address_component.long_name
                }
                if (type == "postal_code"){
                    $scope.data[postcode] = address_component.long_name.split(" ")[0]
                }
                if($scope.data.pickup_town == "" && type == "locality"){
                    $scope.data[town] = address_component.long_name
                }
            })
        })

        $scope.data[address] = newVal.formatted_address;
    }

    $scope.$watch("data.pickup_details", function(newVal){
        getAddressComponents(newVal, 'pickup_town', 'pickup_postcode_prefix', 'pickup_formatted_address');
    })

    $scope.$watch("data.destination_details", function(newVal){
        getAddressComponents(newVal, 'destination_town', 'destination_postcode_prefix', 'destination_formatted_address');
    })

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
        var pickup_date = $scope.data.pickup_date;
        var destination_date = $scope.data.destination_date
        var expiry_time = $scope.data.expiry_time;
        var pickup_date_end = $scope.data.pickup_date_end;
        var destination_date_end = $scope.data.destination_date_end;

        if ($scope.data.pickup_latitude == undefined || $scope.data.destination_latitude == undefined){
            $notifier.error("Location not registered. Please select locations from the dropdown.");
            return;
        }

        $scope.data.pickup_date = $moment($scope.data.pickup_date).format(dateFormat);
        $scope.data.destination_date = $moment($scope.data.destination_date).format(dateFormat);
        $scope.data.expiry_time = $moment($scope.data.expiry_time).format(dateFormat);
        $scope.data.pickup_date_end = $moment($scope.data.pickup_date_end).isValid() ? $moment($scope.data.pickup_date_end).format(dateFormat) : null;
        $scope.data.destination_date_end = $moment($scope.data.destination_date_end).isValid() ? $moment($scope.data.destination_date_end).format(dateFormat) : null;
        $scope.formSubmited = true;

        if ($scope.type() == 'new' || $scope.type() == 'repost'){
            $err.tryPromise($restUser.all('jobs').post($scope.data)).then(function () {
                $notifier.success('Job posted successfully');
                $app.goTo('admin.jobs');
            }, function (error) {
                $scope.data.pickup_date = pickup_date;
                $scope.data.destination_date = destination_date;
                $scope.data.expiry_time = expiry_time;
                $scope.data.pickup_date_end = pickup_date_end;
                $scope.data.destination_date_end = destination_date_end;
                $scope.formSubmited = false;
            });
        }

        if ($scope.type() == 'edit'){
            $err.tryPromise($restUser.one('jobs', $scope.data.id).patch($scope.data)).then(function () {
                $notifier.success('Job edited successfully');
                $app.goTo('admin.jobs');
            }, function (error) {
                $scope.data.pickup_date = pickup_date;
                $scope.data.destination_date = destination_date;
                $scope.data.expiry_time = expiry_time;
                $scope.data.pickup_date_end = pickup_date_end;
                $scope.data.destination_date_end = destination_date_end;
                $scope.formSubmited = false;
            });
        }
    };

    $scope.cancel = function () {
        $app.goTo('admin.jobs');
    };

    $scope.destroy = function(){
        $err.tryPromise($restUser.one('jobs', $scope.data.id)
            .remove())
            .then(function () {
                $notifier.success('Job deleted successfully');
                $app.goTo('admin.jobs');
            })
    };

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

    $scope.setUserId = function($item, $model) {
        $scope.data.user_id = $item.id;
        $scope.data.user_info = $item;
    }

    $scope.getUsers = function(value) {
        return $restUser.all('user').getList(flattenParams({
            filters: {
                search: value,
                inactivated: 0
            }
        })).then(function (result) {
            return result.plain();
        });
    }

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

    // Set the scope data values to the values of the job you want to repost

    if ($stateParams.repost_job != null){
        setTimeout(function(){
            $stateParams.repost_job.user_id = $stateParams.repost_job.user_info.id;
            $scope.data = $stateParams.repost_job;
            $scope.data.pickup_date = getDefaultDate(0);
            $scope.data.destination_date = getDefaultDate(1, true);
            $scope.data.expiry_time = $moment().add(1, "d").toDate();
            delete $scope.data.status;
        }, 150)
    }
    if ($stateParams.edit_job != null){
        setTimeout(function(){
            $stateParams.edit_job.user_id = $stateParams.edit_job.user_info.id;
            $scope.data = $stateParams.edit_job;
        }, 150)
    }
});
