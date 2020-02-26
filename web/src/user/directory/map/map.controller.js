'use strict'

angular
    .module('app')
    .controller('DirectoryLocationController', DirectoryLocationController);

DirectoryLocationController.$inject = ['$scope', '$location', 'modalParams', 'uiGmapIsReady', 'uiGmapGoogleMapApi', '$timeout'];

function DirectoryLocationController($scope, $location, modalParams, uiGmapIsReady, uiGmapGoogleMapApi, $timeout) {

  if (! modalParams.lat || ! modalParams.lng || ! modalParams.radius) {
    return;
  }

  $scope.map = {
    zoom: 10,
    center: {
      latitude: modalParams.lat,
      longitude: modalParams.lng
    },
    bounds: {},
    control: {},
    marker: {
      key: 1
    },
    circle: {
      id: 1,
      events: {
        dragend: function(circle, eventName, scope) {
          console.log("dragend");
          circle.getMap().fitBounds(circle.getBounds());
        },
        radius_changed: function(circle, eventName, scope) {
          console.log("radius changed");
          circle.getMap().fitBounds(circle.getBounds());
        }
      }
    },
    polyLines: []
  };

  $scope.$displayMap = false;

  $timeout(function() {
    $scope.map.center = {
      latitude: modalParams.lat,
      longitude: modalParams.lng
    }
    $scope.map.circle.radius = modalParams.radius * 1609.344;
    $scope.map.circle.center = $scope.map.center;
    $scope.$displayMap = true;
  })

  $scope.$destroy = function() {
    $scope.displayMap = false;
  }

  $scope.mapOptions = {
    scrollWheel: false
  };

}