'use strict';

angular.module('app')
    .controller('FooterController', function ($rootScope, $scope, $app, $state, $notifier, $location, $restApp, FileUploader) {
        $scope.errors = null;
        $scope.uploader = new FileUploader();
        $scope.myImage = '';
        $scope.formData = {
            team_id: $rootScope.userRegistration.team_id,
            invoice_footer_text: '',
            invoice_including_vat: false,
        };

        $scope.data = {
            team_id: $rootScope.userRegistration.team_id,
        };

        $scope.nextStep = function () {
            $location.path('/register/documents');
        };

        $scope.openFileBrowser = function (event) {
            event.preventDefault();
            setTimeout(function () {
                var element = document.getElementById('invoice-logo');
                element.click();
            });
        };

        $scope.uploader.onAfterAddingFile = function (fileItem) {
            $scope.status = 'loading';
            var file = fileItem._file;
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.status = 'loaded';
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };

        $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            $notifier.success('Invoice logo uploaded successfully');
            $scope.uploader.removeFromQueue(fileItem);
        };

        $scope.uploader.onErrorItem = function () {
            $notifier.error('Something went wrong!');
        };

        $scope.submit = function () {
            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];
                item.url = $restApp.one('register/teams', $rootScope.userRegistration.team_id).all('logo').getRestangularUrl();
                item.formData.push($scope.data);
                $scope.uploader.uploadItem(item);
            }

            $scope.formData.registration_progress = 'documents';

            $restApp.all('register/teams').patch($scope.formData).then(function () {
                $notifier.success('Invoice footer text updated successfully');
                $location.path('/register/documents');
            }, function (error) {
                $notifier.error('Something went wrong');
                if (typeof error.data === 'object') {
                    return $scope.errors = _(error.data)
                        .values()
                        .flatten()
                        .value();
                }
            });
        };
    });
