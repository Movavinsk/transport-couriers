'use strict';

angular.module('app')
  .controller('UserAvatarController', function ($q, $scope, $state, modalParams, $restUser, $notifier, $app, $err, FileUploader, $auth) {

    $scope.uploader = new FileUploader();

    $scope.user_id = modalParams.user_id || null;

    $scope.data = {
      user_id: $scope.user_id
    };

    $scope.myImage='';
    $scope.myCroppedImage='';

    $scope.store = function () {
      if ($scope.uploader.queue.length > 0) {
        var item = $scope.uploader.queue[0];

        item.url = $restUser.all('avatar').getRestangularUrl();

        item.formData.push($scope.data);

        $scope.uploader.uploadItem(item);
      }
    };

    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.status = 'loading';
      var file=fileItem._file;
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.status = 'loaded';
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };

    /**
     * Upload Blob (cropped image) instead of file.
     * @see
     *   https://developer.mozilla.org/en-US/docs/Web/API/FormData
     *   https://github.com/nervgh/angular-file-upload/issues/208
     */
    $scope.uploader.onBeforeUploadItem = function(item) {
      var blob = dataURItoBlob($scope.myCroppedImage);
      item._file = blob;
    };

    /**
     * Converts data uri to Blob. Necessary for uploading.
     * @see
     *   http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
     * @param  {String} dataURI
     * @return {Blob}
     */
    var dataURItoBlob = function(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var array = [];
      for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: mimeString});
    };

    $scope.uploader.onProgressItem = function(fileItem, progress) {
      $scope.progress = progress;
    };

    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      $notifier.success('Avatar uploaded successfully');
      $scope.uploader.removeFromQueue(fileItem);
      if($scope.user_id == $auth.user().id) {
        $auth.user().avatar_url = response.data.avatar + '?decache=' + Math.random();
      }
      $app.goTo('user.account.profile');
      $scope.$close(true);
    };

    $scope.uploader.onErrorItem = function() {
      $notifier.error("Something went wrong!");
    };
  });
