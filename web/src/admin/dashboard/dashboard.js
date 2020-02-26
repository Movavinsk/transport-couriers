'use strict';

angular.module('app')
    .config(function($stateProvider) {
        $stateProvider
            .state('admin.dashboard', {
                url: '/dashboard',
                page: {
                    title: 'Dashboard',
                    subTitle: 'Temporary'
                },
                controller: 'DashboardController',
                templateUrl: 'src/admin/dashboard/dashboard.html',
                menu: {
                    name: 'Dashboard',
                    class: 'icon-home',
                    tag: 'admin',
                    priority: 10
                }
            });
    });
