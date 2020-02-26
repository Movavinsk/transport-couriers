'use strict';

angular.module('app')
    .controller('AdminTeamNotesEditController', function ($q, $auth, $scope, $state, modalParams, $restUser, $restAdmin, $notifier, $app, $err, $restApp) {
        $scope.team_id = modalParams.id || null;
        $scope.user_id = $auth.user().id;

        $scope.data = {
            user_id: $scope.user_id,
            team_id: $scope.team_id,
        };

        $scope.formSubmitted = false;

        if (!modalParams.id) return;

        $scope.mode = 'add';

        if (modalParams.note_id) {
            $scope.mode = 'edit';
            $scope.note_id = modalParams.note_id;

            $err.tryPromise($restAdmin.one('teams', $scope.team_id).one('notes', $scope.note_id).get()).then(function (data) {
                $scope.data.content = data.content;
            });
        }

        $scope.store = function () {
            $scope.formSubmitted = true;
            
            if ($scope.mode === 'add') {
                $restAdmin.one('teams', $scope.team_id).all('notes').post($scope.data).then(function () {
                    $notifier.success('Notes added successfully');
                    $scope.$close(true);
                    $scope.formSubmitted = false;
                }, function (error) {
                    $notifier.error('Something went wrong');
                    if (typeof error.data === 'object') {
                        return $scope.errors = _(error.data)
                            .values()
                            .flatten()
                            .value();
                    }
                });
            } else {
                $restAdmin.one('teams', $scope.team_id).one('notes', $scope.note_id).put($scope.data).then(function () {
                    $notifier.success("Notes updated successfully");
                    $app.goTo('admin.teams.edit', { id: $scope.team_id });
                    $scope.$close(true);
                    $scope.formSubmitted = false;
                }, function (error) {
                    $notifier.error('Something went wrong');
                    if (typeof error.data === 'object') {
                        return $scope.errors = _(error.data)
                            .values()
                            .flatten()
                            .value();
                    }
                });
            }
        };
    });
