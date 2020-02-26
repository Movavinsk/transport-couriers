'use strict';

angular.module('app')
  .controller('UserWorkPodController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $auth) {

    if (!modalParams.job_id) return;

    $scope.formSubmitted = false;

    $scope.job_id = modalParams.job_id || null;

    $scope.uploader = new FileUploader();

    $err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function (job) {
      if ($auth.user().id === job.user_id || $auth.user().id === job.bid_user_id) {
        $scope.job = job;
        $scope.data = {
          job_id: $scope.job.id,
          delivery_date: $moment($scope.job.destination_date).format()
        };
        $scope.minDate = $moment($scope.job.pickup_date).toDate();
      }
    });

    $scope.store = function () {
      $scope.formSubmitted = true;
      $scope.data.delivery_date = $moment($scope.data.delivery_date).format();

      if ($scope.uploader.queue.length > 0) {
        var item = $scope.uploader.queue[0];

        item.url = $restUser.all('pods').getRestangularUrl();

        item.formData.push($scope.data);

        $scope.uploader.uploadItem(item);
      } else {
        $err.tryPromise($restUser.all('pods').post($scope.data)).then(function () {
          $scope.job.status = 'delivered';
          $scope.job.status_date = $moment().format();
          $err.tryPromise($scope.job.put()).then(function () {
            $notifier.success('POD sent successfully');
            $scope.$close(true);
          },function(error){
            $scope.formSubmitted = false;
          });
        });
      }
    };

    $scope.uploader.onAfterAddingFile = function(fileItem) {
      $scope.file = {
        name : fileItem.file.name,
        size : fileItem.file.size
      }
    };

    $scope.uploader.onProgressItem = function (fileItem, progress) {
      $scope.progress = progress;
    };

    $scope.uploader.onSuccessItem = function (fileItem, response, status, header) {
      $scope.job.status = 'delivered';
      $scope.job.status_date = $moment().format();
      $scope.uploader.removeFromQueue(fileItem);
      $err.tryPromise($scope.job.put()).then(function () {
        $notifier.success('POD sent successfully');
        $scope.$close(true);
      });
    };

    $scope.uploader.onErrorItem = function () {
      $notifier.error("Something went wrong!");
    };
  });