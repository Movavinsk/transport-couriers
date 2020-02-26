'use strict';

angular
    .module('app')
    .controller('UserProfileVehiclesController', VehiclesController);

VehiclesController.$inject = ["$location", "$scope", "$auth", "$restUser", "$err", "ngTableParams", '$restApp'];

function VehiclesController($location, $scope, $auth, $restUser, $err, ngTableParams, $restApp) {

    $auth.assure(function() {
        $scope.user_id = $location.search().user_id ? $location.search().user_id : $auth.user().id;

        $scope.tableParams = new ngTableParams(
          angular.extend(
            {
              page: 1,
              count: 10,
              sorting: {
                size: 'asc'
              }
            },
            $location.search()
          ), {
            total: 0,
            getData: function ($defer, params) {

                $location.search(params.url());

                $err.tryPromise($restUser.one('profile', $scope.user_id).all('vehicles').getList())
                    .then(function(vehiclesOwned) {
                        $scope.vehiclesOwned = vehiclesOwned;
                        return $err.tryPromise($restApp.all('vehicles').getList({'sorting[sort_no]': "asc"}))
                    })
                    .then(function(vehicles) {
                        $scope.vehicles = vehicles;
                        $defer.resolve($scope.vehicles);
                    });

            }
        });

        $scope.owns = function checkIfVehicleIsOwned(id) {
            return _.find($scope.vehiclesOwned, function(vehicle, index) {
                return vehicle.id === id;
            })
        }

        /**
        *   Toggle user's vehicle
        */
        $scope.toggleVehicle = function(vehicle) {
            var index = _.findIndex($scope.vehiclesOwned, function(owned) {
              return owned.id == vehicle.id;
            })

            if (index > -1) {
              $scope.vehiclesOwned.splice(index, 1);
            } else {
              $scope.vehiclesOwned.push(vehicle);
            }

            $err.tryPromise($restUser.one('profile', $scope.user_id).all("vehicles").post($scope.vehiclesOwned))
                .then(function(response) {
                    $scope.vehiclesOwned = response[0];
                })
        }

});

}
