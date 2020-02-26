'use strict';

angular
    .module('app')
    .config(function ($stateProvider) {
        $stateProvider
            .state('admin.partners.edit.benefits.edit', {
                url: '/{benefit_id}/edit',
                preserveQueryParams: true,
                page: {
                    title: 'Add/Edit Benefit',
                    class: 'fa fa-plus',
                    description: 'Add/Edit Benefits'
                },
                modal: 'md',
                controller: 'AdminPartnerBenefitController',
                templateUrl: 'src/admin/partners/benefits/edit/edit.html'
            })
            .state('admin.partners.edit.benefits.add', {
                url: '/add',
                preserveQueryParams: true,
                page: {
                    title: 'Add Benefit',
                    class: 'fa fa-plus',
                    description: 'Edit Benefit'
                },
                modal: 'md',
                controller: 'AdminPartnerBenefitController',
                templateUrl: 'src/admin/partners/benefits/edit/edit.html'
            });
    });
