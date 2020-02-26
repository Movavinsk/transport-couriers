'use strict';

angular.module('app')
  .controller('TeamDocumentAddController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $auth) {

    if( ! modalParams.team_id ) return;

    $scope.team_id = modalParams.team_id || null;

    $scope.uploader = new FileUploader();

    $scope.formSubmitted = false;

    $scope.data = {
      team_id: $scope.team_id,
      user_id: undefined,
      type_id: 0,
      status: 'pending'
    };

    $restUser.all('doctypes').getList().then(function(result) {
        $scope.doctypes = result;
    });

    $restUser.one('team', $auth.user().team_id).get().then(function(team) {
      $scope.team = team;
    });

    $scope.store = function () {
      $scope.formSubmitted = true;

      if ($scope.data.selected_type.expiry_required === 0) {
        $scope.data.expiry = "0000-00-00";
      } else {
        if ($scope.mode === 'add') {
          $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
        }
      }

      if ($scope.uploader.queue.length > 0) {
        var item = $scope.uploader.queue[0];

        if (undefined !== $scope.data.user_id) {
          item.url = $restUser.one('profile', $scope.data.user_id).all("documents").getRestangularUrl();
          item.formData.push($scope.data);
          $scope.uploader.uploadItem(item);
        }

      }
    };

    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.file = {
        name : fileItem.file.name,
        size : fileItem.file.size
      }
    };

    $scope.uploader.onProgressItem = function(fileItem, progress) {
      $scope.progress = progress;
    };

    $scope.uploader.onSuccessItem = function (item, response, status, header) {
      $scope.formSubmitted = false;
      $notifier.success('Document uploaded successfully');
      $scope.uploader.removeFromQueue(item);
      $app.goTo('user.account.team.documents');
      $scope.$close(true);
    };

    $scope.uploader.onErrorItem = function() {
      $scope.formSubmitted = false;
      $notifier.error("Something went wrong!");
    };
  });