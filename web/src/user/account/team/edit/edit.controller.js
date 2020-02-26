'use strict';

angular.module('app').controller('UserTeamEditController', function ($rootScope, $auth, $scope, $validation, $restUser, $notifier, FileUploader) {

  $scope.team = {};

  $scope.formSubmitted = false;

  FileUploader.prototype.onCompleteItem = function (item, response, status, headers) {
    if (status == 422) {
      $validation.handle(response);
    }
    else if (status >= 200 && status < 300) {
      loadTeam();
    }
  };

  $scope.uploader = new FileUploader();

  function loadTeam() {
    $restUser.one('team', $auth.user().team_id).get().then(function (team) {
      $scope.team = team;
    });
  }

  $auth.assure(loadTeam);

  $scope.update = function () {
    $scope.formSubmitted = true;

    if ($scope.team.use_company_address) {
      $scope.team.invoice_address_line_1 = $scope.team.address_line_1;
      $scope.team.invoice_address_line_2 = $scope.team.address_line_2;
      $scope.team.invoice_town = $scope.team.town;
      $scope.team.invoice_county = $scope.team.county;
      $scope.team.invoice_postal_code = $scope.team.postal_code;
    }

    if ($scope.uploader.queue.length > 0) {
      var item = $scope.uploader.queue[0];

      item.url = $scope.team.getRestangularUrl() + "?_method=PUT&wantsJson=1";

      $scope.team.deactivated_at = 0;
      item.formData.push($scope.team.plain());

      $scope.uploader.uploadItem(item);
    }
    else {
      $scope.team.save().then(function () {
          $validation.clear();
          $scope.formSubmitted = false;
          $notifier.success('The team was successfully updated!');
        },
        function (error) {
          $scope.formSubmitted = false;
          $validation.performFromResponse
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
