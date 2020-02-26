'use strct';

angular
    .module('app')
    .controller('UserBenefitsController', UserBenefitsController);

UserBenefitsController.$inject = ['$scope', '$restUser', '$location', '$err', 'ngTableParams'];

function UserBenefitsController($scope, $restUser, $location, $err, ngTableParams) {

  $scope.benefits = undefined;

  $restUser.all('benefits').getList()
    .then(function(result) {
      $scope.benefits = result;
    });

}