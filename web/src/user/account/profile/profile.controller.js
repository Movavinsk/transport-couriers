'use strict';

angular.module('app')
  .controller('UserProfileController', function ($scope, FileUploader, $location, $q, $state, $stateParams, $auth, $restUser, $notifier, $app, $err, $geo) {

    $scope.uploader = new FileUploader();
    $scope.formSubmitted = false;

    $scope.rand = Math.random();
    $auth.assure(function () {
      $scope.user_id = $scope.id = $auth.user().id;

      $restUser.one('profile', $scope.user_id).get().then(function (data) {
        $scope.data = data;
      });
    });

    $scope.update = function () {
      $scope.formSubmitted = true;
      if ($scope.uploader.queue.length > 0) {
        var item = $scope.uploader.queue[0];

        item.url = $restUser.one('profile', $scope.data.id).getRestangularUrl() + "?_method=PUT";

        item.formData.push($scope.data);

        $scope.uploader.uploadItem(item);
      } else {
        $err.tryPromise($scope.data.put()).then(function () {
          $auth.check().then(function () {
            $scope.formSubmitted = false;
            $notifier.success('Profile saved successfully!');
          });
        });
      }
    };

    $scope.uploader.onAfterAddingFile = function (fileItem) {
      $scope.file = {
        name: fileItem.file.name,
        size: fileItem.file.size
      }
    };

    $scope.uploader.onProgressItem = function (fileItem, progress) {
      $scope.progress = progress;
    };

    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      $auth.check().then(function () {
        $scope.rand = Math.random();
        $scope.uploader.removeFromQueue(fileItem);
        delete $scope.file;
        delete $scope.progress;
        $scope.formSubmitted = false;
        $notifier.success('Profile saved successfully!');
      });
    };

    $scope.uploader.onErrorItem = function () {
      $scope.formSubmitted = false;
      $notifier.error("Something went wrong!");
    };
  });
