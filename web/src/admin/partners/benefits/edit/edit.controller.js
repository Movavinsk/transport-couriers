'use strict';

angular
    .module('app')
    .controller('AdminPartnerBenefitController', AdminPartnerBenefitController);

AdminPartnerBenefitController.$inject = ['$scope', 'modalParams', '$restAdmin', '$err', '$notifier', '$app'];

function AdminPartnerBenefitController($scope, modalParams, $restAdmin, $err, $notifier, $app) {

    if( ! modalParams.partner_id ) return;

    $scope.partner_id = modalParams.partner_id || null;
    $scope.benefit_id = modalParams.benefit_id || null;

    if ($scope.benefit_id) {
        $scope.mode = 'edit';
    } else {
        $scope.mode = 'add';
    }

    if ($scope.mode === 'add') {
        $scope.benefit = {
            url: 'http://'
        }
    } else {
        $err.tryPromise($restAdmin.one('partners', $scope.partner_id).one('benefits', $scope.benefit_id).get())
            .then(function(result) {
                $scope.benefit = result;
            })
    }

    $scope.store = function() {
        if (!/^http/.test($scope.benefit.url)) {
            $scope.benefit.url = $scope.benefit.url.replace (/^/, 'http://');
        }

        if ($scope.mode === 'add') {
            $err.tryPromise($restAdmin.one('partners', $scope.partner_id).post('benefits', $scope.benefit))
                .then(function(result) {
                    $scope.$dismiss();
                    $notifier.success('Benefit added.');
                    $app.goTo('admin.partners');
                })
        } else {
            $err.tryPromise($scope.benefit.put())
                .then(function(result) {
                    $scope.$dismiss();
                    $notifier.success('Benefit updated.');
                    $app.goTo('admin.partners');
                })
        }
    }

}