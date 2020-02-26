'use strict';

angular.module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.vehicles', {
                url: '/vehicles',
                preserveQueryParams: true,
                page: {
                    title: 'Vehicles',
                    class: 'fa fa-car',
                    description: 'Manage all users'
                },
                controller: 'AdminVehiclesController',
                templateUrl: 'src/admin/vehicles/list.html',
                menu: {
                    name: 'Vehicles',
                    class: 'fa fa-car',
                    tag: 'admin',
                    priority: 3
                }
            });
    });
