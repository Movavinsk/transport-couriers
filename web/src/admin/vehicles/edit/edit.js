'use strict';

/**
 * Add/Edit form for a single user
 */
angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.vehicles.add', {
                url: '/new',
                page: {
                    title: 'Vehicles',
                    class: 'fa fa-car',
                    description: 'Manage all vehicles'
                },
                controller: 'AdminVehiclesEditController',
                templateUrl: 'src/admin/vehicles/edit/edit.html',
                menu: {
                    name: 'Vehicle',
                    class: 'fa fa-car',
                    tag: 'action'
                }
            })
            .state('admin.vehicles.edit', {
                url: '/edit/{id}',
                page: {
                    title: 'Vehicles',
                    class: 'fa fa-car',
                    description: 'Manage all vehicles'
                },
                controller: 'AdminVehiclesEditController',
                templateUrl: 'src/admin/vehicles/edit/edit.html'
            });
    });
