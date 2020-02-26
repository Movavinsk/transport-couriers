"use strict";

angular
    .module('app')
    .controller('UserMembersDirectoryController', UserMembersDirectoryController);

UserMembersDirectoryController.$inject = ['$scope', '$restUser', '$location', '$err', 'ngTableParams', '$q', '$restDirectory', '$restApp', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$timeout'];

function UserMembersDirectoryController($scope, $restUser, $location, $err, ngTableParams, $q, $restDirectory, $restApp, uiGmapGoogleMapApi, uiGmapIsReady, $timeout) {

  // Init Filters
  $scope.filters = {};
  $scope.filterByLocation = 'filter[member_address]' in $location.$$search ? true : false;
  $scope.filterByVehicle = 'filter[vehicle_min]' in $location.$$search ? true : false;
  $scope.filters.member_miles = 'filter[member_miles]' in $location.$$search ? parseInt($location.$$search['filter[member_miles]']) : 0;

  // Main Members listing
  $scope.tableParams = new ngTableParams(
    angular.extend(
      {
        page: 1,
        count: 10,
        sorting: {
          created_at: 'desc'
        },
      },
      $location.search()
    ), {
      total: 0,
      getData: function ($defer, params) {
        $location.search(params.url());
        $scope.loading = true;
        $err.tryPromise($restDirectory.all('teams').getList(params.url()))
          .then(function(response) {
            response.forEach(function(item) {
              item.isCollapsed = true;
            })
            $scope.tableParams.settings({total: response.paginator.total});
            $defer.resolve(response);
            $timeout(function() {
              $scope.loading = false;
            }, 500)
          });
    }
  });

    $scope.blockMember = function(id) {
        $restApp.all('user/team/block').post({ blocked_team_id: id }).then(function () {
            $scope.tableParams.reload();
        });
    };

    $scope.unBlockMember = function(id) {
        $restApp.all('user/team/unblock').post({ blocked_team_id: id }).then(function () {
            $scope.tableParams.reload();
        });
    };

  // ----------- FEEDBACK
  $scope.getFeedback = function(team) {
    if (team.feedback) {
      return team.feedback;
    }
    team.feedback = new ngTableParams(
      {
        page: 1,
        count: 10,
        sorting: {
          created_at: 'desc'
        }
      }, {
        total: 0,
        counts: [],
        getData: function ($defer, params) {
          $restDirectory.one('teams', team.id).all('feedback').getList(params.url())
            .then(function(result) {
              team.feedback.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
        }
      });
  }


  // ----------- DOCUMENTS
  $scope.getDocuments = function(team) {
    if (team.documents) {
      return team.documents;
    }

    team.documents = new ngTableParams(
      {
        page: 1,
        count: 5,
        sorting: {
          created_at: 'desc'
        }
      }, {
        total: 0,
        getData: function ($defer, params) {
          $restDirectory.one('teams', team.id).all('documents').getList(params.url())
            .then(function(result) {
              team.documents.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
        }
      });
  }

  // ----------- LOCATIONS
  $scope.getLocations = function(team) {
    if (team.locations) {
      return team.locations;
    }

    team.locations = new ngTableParams(
      {
        page: 1,
        count: 5,
        sorting: {
          created_at: 'desc'
        }
      }, {
        total: 0,
        getData: function ($defer, params) {
          $restDirectory.one('teams', team.id).all('locations').getList(params.url())
            .then(function(result) {
              team.locations.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
        }
      });
  }

  // ----------- VEHICLES
  $scope.getVehicles = function(team) {
    if (team.vehicles) {
      return team.vehicles;
    }

    team.vehicles = new ngTableParams(
      {
        page: 1,
        count: 5,
        sorting: {
          created_at: 'desc'
        }
      }, {
        total: 0,
        getData: function ($defer, params) {
          $restDirectory.one('teams', team.id).all('vehicles').getList(params.url())
            .then(function(result) {
              team.vehicles.settings({total: result.paginator.total});
              $defer.resolve(result);
            });
        }
      });
  }

  $scope.map = {
    center: {
      latitude: 51.5073509,
      longitude: -0.12775829999998223
    },
    zoom: 10,
    bounds: {},
    polyLines: []
  };

  $scope.setLocation = function(data) {
    $scope.map.center.latitude = data.latitude;
    $scope.map.center.longitude = data.longitude;
  }

  $scope.$watch('filterByVehicle', function(value) {
    if (!value) {
      delete $scope.tableParams.filter()['vehicle_min'];
      delete $scope.tableParams.filter()['vehicle_max'];
    }
  });

  $scope.$watch('filterByLocation', function(value) {
    if (!value) {
      delete $scope.tableParams.filter()['member_miles'];
      delete $scope.tableParams.filter()['member_address'];
      delete $scope.tableParams.filter()['member_latitude'];
      delete $scope.tableParams.filter()['member_longitude'];
    }
  })

  $scope.$watch('filters.member_miles', function(value) {
    if (value > 0) {
      $scope.tableParams.filter()['member_miles'] = value;
    } else {
      delete $scope.tableParams.filter()['member_miles'];
    }
  });

  $scope.$watch('filterByBlockedMembers', function(value) {
      if (value) {
          $scope.tableParams.filter({ filter_by_blocked_teams: 'true' });
      } else {
          delete $scope.tableParams.filter()['filter_by_blocked_teams'];
      }
  });

  // Filter by vehicles owned
  $err.tryPromise($restApp.all('vehicles').getList({'sorting[size]': "asc"}))
      .then(function(vehicles) {
        $scope.min = vehicles[0].size;
        $scope.max = vehicles[vehicles.length - 1].size;
        $scope.vehicles = vehicles;

        if ($scope.filterByVehicle) {
          var min = parseInt($location.$$search['filter[vehicle_min]'])
          var max = parseInt($location.$$search['filter[vehicle_max]'])
          $scope.filters.vehicle_min = min;
          $scope.filters.vehicle_max = max;
        } else {
          $scope.filters.vehicle_min = 100;
          $scope.filters.vehicle_max = $scope.vehicles.length * 100;
        }

        $scope.$watchGroup(['filters.vehicle_min', 'filters.vehicle_max'], function(val, old) {
          if (_.isEqual(val, old)) return;
          $scope.tableParams.filter()['vehicle_min'] = val[0];
          $scope.tableParams.filter()['vehicle_max'] = val[1];
        })

      })

}