'use strict';

angular.module('app')
    .controller('AdminUsersEditController', function ($q, $scope, $state, $stateParams, $restAdmin, $notifier, $app, $err, ngTableParams, $restApp, $restUser, $moment) {

        $scope.mode = 'Loading...';

        $scope.userCreated = false;

        $scope.id = $stateParams.id || null;

        $scope.data = { roles_ids: [] };

        $scope.settings = {
            vehicle_type: [
                { label: 'All Vehicles Sizes', value: 'all' },
                { label: 'My vehicles only', value: 'vehicle_only' },
                { label: 'Custom scale', value: 'custom' },
            ],
            location: [
                { label: 'My Locations Only', value: 'location_only' },
                { label: 'All Locations', value: 'all' },
            ],
        };

        $err.tryPromise($restApp.all('vehicles').getList({ 'sorting[size]': 'asc' }))
            .then(function (vehicles) {
                $scope.min = vehicles[0].size;
                $scope.max = vehicles[vehicles.length - 1].size;
                $scope.vehiclesList = vehicles;
                $scope.vehiclesList = vehicles;
            });

        //User roles
        $scope.roles = [];

        $restAdmin.all('roles').getList().then(function (roles) {
            $scope.roles = roles;
            $scope.rolesIds = _.pluck(roles.plain(), 'id');
            $scope.rolesIndexed = _.indexBy(roles.plain(), 'id');
        });

        //User teams
        $scope.teams = [];
        var params = {
            page: '1',
            count: '-1',
            'sorting[company_name]': 'asc',
        };
        $restAdmin.all('teamlist').getList(flattenParams(params)).then(function (teams) {
            $scope.teams = teams;
        });

        //Manage user
        $scope.isAdd = function () {
            return $scope.id === null;
        };

        $scope.isEdit = function () {
            return $scope.id !== null;
        };

        if ($scope.isAdd()) {
            $scope.mode = 'Add';
        }
        else {
            $err.tryPromise($restAdmin.one('users', $scope.id).get()).then(function (data) {
                $scope.mode = 'Edit';
                $scope.data = data;
                $scope.can_use_client_api = data.can_use_client_api;

                if (data.team_id && data.team_id > 0) {
                    $err.tryPromise($restAdmin.one('teams', data.team_id).get()).then(function (data) {
                        if ($scope.teams.length === 0) {
                            $scope.teams.push(data);
                        }
                    });
                }

                $scope.data.settings.custom_max = data.settings.custom_max ? data.settings.custom_max : $scope.vehiclesList[$scope.vehiclesList.length - 1].size;
                $scope.data.settings.custom_min = data.settings.custom_min ? data.settings.custom_min : $scope.vehiclesList[0].size;
            });

            //User documents
            $scope.documents = new ngTableParams(
                {
                    page: 1,
                    count: 5,
                    sorting: {
                        created_at: 'desc',
                    },
                }, {
                    total: 0,
                    getData: function ($defer, params) {
                        $err.tryPromise($restAdmin.one('users', $scope.id).all('documents').getList(params.url())).then(function (result) {
                            $scope.documents.settings({ total: result.paginator.total });
                            $defer.resolve(result);
                        });
                    },
                });

            //User locations
            $scope.locations = new ngTableParams({
                page: 1,
                count: 5,
                sorting: {
                    created_at: 'desc',
                },
            }, {
                total: 0,
                getData: function ($defer, params) {
                    $err.tryPromise($restAdmin.one('users', $scope.id).all('locations').getList(params.url())).then(function (result) {
                        $scope.locations.settings({ total: result.paginator.total });
                        $defer.resolve(result);
                    });
                },
            });

            // User Vehicles
            $scope.vehicles = new ngTableParams({
                page: 1,
                count: 5,
                sorting: {
                    created_at: 'desc',
                },
            }, {
                total: 0,
                getData: function ($defer, params) {
                    $err.tryPromise($restUser.one('profile', $scope.id).all('vehicles').getList())
                        .then(function (owned) {
                            $scope.vehiclesOwned = owned;
                            $defer.resolve($scope.vehiclesList);
                        });
                },
            });

            //User feedback
            $scope.feedback = [];
            $err.tryPromise($restAdmin.one('users', $scope.id).all('feedback').getList()).then(function (result) {
                $scope.feedback = result;
            });

            // API details
            $scope.api = [];
            $err.tryPromise($restAdmin.one('api-details', $scope.id).get()).then(function (result) {
                $scope.api = result;
            });
        } // fi

        $scope.store = function () {
            $scope.userCreated = true;
            $err.tryPromise($restAdmin.all('users').post($scope.data)).then(function () {
                $app.goTo('admin.users');
            }, function (error) {
                $scope.userCreated = false;
            });
        };

        $scope.update = function () {
            $err.tryPromise($scope.data.patch()).then(function () {
                $app.goTo('admin.users');
            });
        };

        $scope.destroy = function () {
            $err.tryPromise($scope.data.remove()).then(function () {
                $app.goTo('admin.users');
            });
        };

        $scope.cancel = function () {
            $app.skipTo('admin.users');
        };

        $scope.toggleBidding = function () {
            var bidding = $scope.roles.byName('driver');
            if ($scope.data.hasRole('driver')) {
                $scope.data.detachRole(bidding);
            }
            else {
                $scope.data.attachRole(bidding);
            }
        };

        $scope.toggleAdmin = function () {
            var admin = $scope.roles.byName('admin');
            if ($scope.data.hasRole('admin')) {
                $scope.data.detachRole(admin);
            }
            else {
                $scope.data.attachRole(admin);
            }
        };

        $scope.destroyDocument = function (document) {
            $err.tryPromise(document.remove()).then(function () {
                $notifier.success('Document removed successfully');
                $scope.documents.reload();
            });
        };

        $scope.approveDocument = function (document) {
            document.status = 'approved';
            $err.tryPromise(document.put()).then(function () {
                $notifier.success('Document approved successfully');
                $scope.documents.reload();
            });
        };

        $scope.destroyLocation = function (location) {
            $err.tryPromise(location.remove()).then(function () {
                $notifier.success('Location removed successfully');
                $scope.locations.reload();
            });
        };

        /**
         * Toggle user's vehicle
         */
        $scope.toggleVehicle = function (vehicle) {
            var index = _.findIndex($scope.vehiclesOwned, function (owned) {
                return owned.id == vehicle.id;
            });

            if (index > -1) {
                $scope.vehiclesOwned.splice(index, 1);
            } else {
                $scope.vehiclesOwned.push(vehicle);
            }

            $err.tryPromise($restAdmin.one('users', $scope.id).all('vehicles').post($scope.vehiclesOwned))
                .then(function (response) {
                    $scope.vehiclesOwned = response[0];
                });
        };

        $scope.owns = function checkIfVehicleIsOwned (id) {
            return _.find($scope.vehiclesOwned, function (vehicle, index) {
                return vehicle.id === id;
            });
        };

        $scope.createDate = function (date) {
            return new Date(date);
        };
    });
