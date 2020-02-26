'use strict';

angular.module('app')
  .controller('UserTeamEditMemberController', function ($err, $rootScope, $notifier, $scope, modalParams, $restUser, $validation) {

    $scope.user_id = modalParams.user_id || null;
    $scope.team_id = modalParams.team_id || null;

    $scope.formSubmitted = false;

    $scope.data = {};

    if(!$scope.user_id && !$scope.team_id) return;

    $scope.isAdd = function () {
      return $scope.user_id === null;
    };

    $scope.isEdit = function () {
      return $scope.team_id === null;
    };

    if ($scope.isAdd()) {
      $scope.mode = 'Add';

      $restUser.one('team', $scope.team_id).get().then(function (team) {
        $scope.team = team;
      });

      $scope.data = {
        team_id: $scope.team_id
      };
    }
    else {
      $err.tryPromise($restUser.one('profile', $scope.user_id).get()).then(function (data) {
        $scope.mode = 'Edit';
        $scope.data = data;
      });
    }

    $scope.store = function () {
      $scope.formSubmitted = true;
      $scope.team.all('members').post($scope.data).then(
        function () {
          $notifier.success("The member was successfully added.");
          $scope.$close(true);
        },
        function (response) {
          $scope.formSubmitted = false;
          $validation.handle(response.data);
        });
    };

    $scope.update = function () {
      $scope.formSubmitted = true;
      $err.tryPromise($scope.data.put()).then(function () {
        $notifier.success("The member was successfully updated.");
        $scope.$close(true);
      });
    }
  });
