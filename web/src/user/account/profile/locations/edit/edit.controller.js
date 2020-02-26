'use strict';

angular.module('app')
  .controller('UserProfileLocationsEditController', function ($q, $auth, $scope, $state, modalParams, $restUser, $notifier, $app, $err, $location, uiGmapIsReady) {

    $scope.id = modalParams.id || null;

    $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;

    $scope.formSubmitted = false;

    $scope.miles = [
      {
        id: 5,
        name: '5 miles',
        zoom: 11
      },
      {
        id: 10,
        name: '10 miles',
        zoom: 10
      },
      {
        id: 20,
        name: '20 miles',
        zoom: 9
      },
      {
        id: 50,
        name: '50 miles',
        zoom: 8
      }
    ];

    $scope.map = {
      control: {},
      center: {
        latitude: 51.5073509,
        longitude: -0.12775829999998223
      },
      zoom: 10,
      options: {
        scrollwheel: false
      },
      circles: [{
        id: 1
      }],
      refresh: function (center) {
        $scope.map.control.refresh(center);
      }
    };

    $scope.$watch("data.latitude", function(newVal, oldVal) {
      if(newVal !== oldVal) {
        $scope.map.circles[0].center = {latitude: $scope.data.latitude, longitude: $scope.data.longitude};
        $scope.map.circles[0].radius = $scope.data.miles * 1609.344
        $scope.map.refresh({latitude: $scope.data.latitude, longitude: $scope.data.longitude});
      }
    });

    $scope.$watch("data.miles", function(newVal, oldVal) {
      if(newVal !== oldVal) {
        var selected = $.grep($scope.miles, function(e){return e.id == $scope.data.miles;});
        $scope.map.circles[0].radius = newVal * 1609.344;
        $scope.map.zoom = selected[0].zoom;
        $scope.map.refresh({latitude: $scope.data.latitude, longitude: $scope.data.longitude});
      }
    });

    $scope.isAdd = function () {
      return $scope.id === null;
    };

    $scope.isEdit = function () {
      return $scope.id !== null;
    };

    if ($scope.isAdd()) {
      $scope.mode = 'Add';
      $scope.data = {
        miles: 10
      }
    }
    else {
      $err.tryPromise($restUser.one('profile', $scope.user_id).one('locations', $scope.id).get()).then(function (data) {
        $scope.mode = 'Edit';
        $scope.data = data;

        $scope.map.circles = [{
          id:1,
          center: {
            latitude: data.latitude,
            longitude: data.longitude
          },
          radius: $scope.data.miles * 1609.344
        }];

        $scope.map.refresh({
          latitude: data.latitude,
          longitude: data.longitude
        });
      });
    }

    uiGmapIsReady.promise(1).then(function (instances) {
      $scope.map.refresh({
        latitude: 51.5073509,
        longitude: -0.12775829999998223
      });
    });

    $scope.store = function() {
      $scope.formSubmitted = true;
      $scope.data.user_id = $scope.user_id;
      $err.tryPromise($restUser.one('profile', $scope.user_id).all("locations").post($scope.data)).then(function () {
        $notifier.success("Location added successfully");
        $app.goTo('user.account.profile.locations');
        $scope.$close(true);
        $scope.formSubmitted = false;
      });
    }

    $scope.update = function () {
      $scope.formSubmitted = true;
      $err.tryPromise($scope.data.put()).then(function () {
        $notifier.success("Location updated successfully");
        $app.goTo('user.account.profile.locations');
        $scope.$close(true);
        $scope.formSubmitted = false;
      });
    };
  });
