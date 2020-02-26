'use strict';

angular.module('app')
    .controller('DocumentController', function ($rootScope, $scope, $app, $state, $notifier, $location, $restApp, FileUploader, $moment) {
        $scope.uploader = new FileUploader();
        $scope.team_id = $rootScope.userRegistration.team_id;
        $scope.formSubmitted = false;
        var dateFormat = 'YYYY-MM-DD HH:mm:ss';

        $scope.data = {
            team_id: $scope.team_id,
            user_id: $rootScope.userRegistration.user_id,
            type_id: 0,
            status: 'pending',
        };

        $scope.defaultDocuments = [
            {
                type_id: 4,
                title: 'Public Liability Insurance',
                isUploaded: false,
            },
            {
                type_id: 5,
                title: 'Drivers License',
                isUploaded: false,
            },
            {
                type_id: 6,
                title: 'Posting Only Declaration',
                isUploaded: false,
            },
            {
                type_id: 8,
                title: 'Insurance Policy Statement',
                isUploaded: false,
            },
            {
                type_id: 9,
                title: 'ADR Certificate',
                isUploaded: false,
            },
            {
                type_id: 11,
                title: 'Employers Liability',
                isUploaded: false,
            },
        ];

        $scope.formData = {
            registration_progress: '',
        };

        $restApp.all('user/doctypes').getList().then(function (result) {
            $scope.doctypes = result;
        });

        $restApp.all('register/profile/documents').getList().then(function (result) {
            $scope.list = result;
            result.forEach(function (element) {
                _.findIndex($scope.defaultDocuments, function (doc) {
                    if (doc.type_id == element.type_id) {
                        return doc.isUploaded = true;
                    }
                });
            });
        });

        $scope.allDocuments = function () {
            $restApp.all('register/profile/documents').getList().then(function (result) {
                $scope.list = result;
                result.forEach(function (element) {
                    _.findIndex($scope.defaultDocuments, function (doc) {
                        if (doc.type_id == element.type_id) {
                            return doc.isUploaded = true;
                        }
                    });
                });
            });
        };

        $scope.delete = function (id, type_id) {
            var url = 'register/profile/' + $scope.data.user_id + '/documents/' + id;
            $restApp.all(url).post({}).then(function () {
                _.findIndex($scope.defaultDocuments, function (doc) {
                    if (doc.type_id == type_id) {
                        return doc.isUploaded = false;
                    }
                });
                $scope.allDocuments();
                $notifier.success('Deleted successfully');
            }, function (response) {
                $scope.errors = response.data;
                $notifier.error('Something went wrong');
            });
        };

        $scope.store = function () {
            $scope.formSubmitted = true;

            if ($scope.data.selected_type.expiry_required === 0) {
                $scope.data.expiry = '0000-00-00';
            } else {
                $scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
            }

            if ($scope.uploader.queue.length > 0) {
                var item = $scope.uploader.queue[0];

                if (undefined !== $scope.data.user_id) {
                    item.url = $restApp.one('register/profile', $scope.data.user_id).all('documents').getRestangularUrl();
                    item.formData.push($scope.data);
                    $scope.uploader.uploadItem(item);
                }

            }
        };

        $scope.uploader.onAfterAddingFile = function (fileItem) {
            $scope.file = {
                name: fileItem.file.name,
                size: fileItem.file.size,
            };
        };

        $scope.uploader.onProgressItem = function (fileItem, progress) {
            $scope.progress = progress;
        };

        $scope.uploader.onSuccessItem = function (item) {
            $scope.formSubmitted = false;
            $notifier.success('Document uploaded successfully');
            $scope.uploader.removeFromQueue(item);
            $scope.allDocuments();
            $scope.closeModal();
        };

        $scope.uploader.onErrorItem = function () {
            $scope.formSubmitted = false;
            $notifier.error('Something went wrong!');
        };

        $scope.openModal = function (type_id) {
            if (type_id) {
                $scope.data.selected_type = $scope.doctypes.filter(function (doctype) {
                    return doctype.id === type_id;
                })[0];
                $scope.data.type_id = type_id;
            }
            $('#upload-doc').modal();
        };

        $scope.closeModal = function () {
            $scope.clear();
            $('#upload-doc').modal('hide');
        };

        $scope.submit = function () {
            $scope.formData.registration_progress = 'complete';
            $restApp.all('register/update-progress').patch($scope.formData).then(function () {
                $location.path('/register/success');
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

        $scope.nextStep = function () {
            this.submit();
        };

        $scope.clear = function () {
            $scope.file = null;
            $scope.upload = undefined;
            $scope.data = {
                team_id: $scope.team_id,
                user_id: $rootScope.userRegistration.user_id,
                type_id: 0,
                status: 'pending',
            };
        };
    });
