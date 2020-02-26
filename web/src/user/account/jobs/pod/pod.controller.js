'use strict';

angular.module('app')
  .controller('UserJobsPodController', function ($scope, modalParams, $restUser, $err, $auth) {

    if( ! modalParams.job_id ) return;

    $scope.job_id = modalParams.job_id || null;

    $err.tryPromise($restUser.all('pods')
        .getList({'filter[job_id]': $scope.job_id}))
        .then(function(data) {
            $restUser.one('team', $auth.user().team_id)
                .get()
                .then(function(team) {
                    if (team.id !== $auth.user().team.id) {
                        return;
                    } else {
                        $scope.pod = data[0];
                    }
                });
        });
  });