'use strict';

angular.module('app')
  .controller('UserProfileDocumentController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment) {

    if( ! modalParams.user_id ) return;

    $scope.user_id = modalParams.user_id || null;

    $scope.uploader = new FileUploader();
    $scope.uploader.filters.push({
        name: 'typeFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|pdf|doc|docx|zip|'.indexOf(type) !== -1;
        }
    });

      $scope.uploader.filters.push({
          name: 'sizeFilter',
          fn: function(item /*{File|FileLikeObject}*/, options) {
              return item.size < 20000000;
          }
      });

    // @TODO this should probably be centralised
    var dateFormat = 'YYYY-MM-DD HH:mm:ss';

    $scope.formSubmitted = false;

    $scope.data = {
      user_id: $scope.user_id,
      type_id: 0,
      status: 'pending'
    };

    $restUser.all('doctypes').getList().then(function(result) {
        $scope.doctypes = result;
    });

    // Min date for fleet insurance expiration
    $scope.minDate = $moment().toDate();

    $scope.store = function () {
      if ($scope.data.selected_type.expiry_required === 0) {
        $scope.data.expiry = "0000-00-00";
      } else {
        $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
      }

      $scope.formSubmitted = true;
      $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
      if ($scope.uploader.queue.length > 0) {
        var item = $scope.uploader.queue[0];
        item.url = $restUser.one('profile', $scope.user_id).all("documents").getRestangularUrl();
        item.formData.push($scope.data);
        $scope.uploader.uploadItem(item);
      }
    }

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
      $app.goTo('user.account.profile.documents');
      $scope.$close(true);
    };

    $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
      $scope.formSubmitted = false;

      if (filter.name === 'typeFilter') {
          $notifier.error("Cannot add " + item.name + " as it is not an allowed file type");
      }

        if (filter.name === 'sizeFilter') {
            $notifier.error(item.name + " is too large, please select a smaller file");
        }
    };

    $scope.uploader.onErrorItem = function() {
      $scope.formSubmitted = false;
      $notifier.error("Something went wrong!");
    };
  });