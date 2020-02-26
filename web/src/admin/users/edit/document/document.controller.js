'use strict';

angular.module('app')
	.controller('AdminAddDocumentController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, FileUploader, $moment, $restAdmin) {

		if (!modalParams.id ) return;

		$scope.mode = 'add';

		if (modalParams.document_id) {
			$scope.mode = 'edit';
			$scope.document_id = modalParams.document_id;
		}

		$scope.user_id = modalParams.id || null;
		$scope.uploader = new FileUploader();
		$scope.formSubmitted = false;

		// MySQL/iDTP exchange format
		var dateFormat = 'YYYY-MM-DD HH:mm:ss';

		$scope.data = {
			user_id: $scope.user_id,
			type_id: 0,
			status: 'pending'
		};

		$restUser.all('doctypes').getList().then(function(result) {
			$scope.doctypes = result;
			// fetch type informations when editing
			if ($scope.mode === 'edit') {
				$err.tryPromise($restAdmin.one('users', $scope.user_id).one('documents', $scope.document_id).get())
					.then(function (data) {
						$scope.data = data;
						// if (data.expiry === '0000-00-00') {
						// 	data.expiry = new $moment(new Date()).format(dateFormat)
						// }
						$scope.data.selected_type = $scope.doctypes.filter(function(doctype) {
							return doctype.id === $scope.data.type_id
						})[0]
						$scope.file = {
							name: data.upload,
						}
					});
			}
		});

		$scope.store = function () {
			$scope.formSubmitted = true;

			if ($scope.data.selected_type.expiry_required === 0) {
				$scope.data.expiry = "0000-00-00 00:00:00";
			} else {
				// if ($scope.mode === 'add') {
					$scope.data.expiry = $moment($scope.data.expiry).format(dateFormat);
				// }
			}

			if ($scope.mode === 'add') {
				if ($scope.uploader.queue.length > 0) {
					var item = $scope.uploader.queue[0];
					item.url = $restUser.one('profile', $scope.user_id).all("documents").getRestangularUrl();
					item.formData.push($scope.data);
					$scope.uploader.uploadItem(item);
				}
			} else {
				$scope.data.put()
					.then(function() {
						$scope.formSubmitted = false;
						$notifier.success('Document successfully updated');
						$app.goTo('admin.teams.edit', {id: $scope.team_id});
						$scope.$close(true);
					})
			}

		};

		$scope.uploader.onAfterAddingFile = function(fileItem) {
			$scope.file = {
				name: fileItem.file.name,
				size: fileItem.file.size
			}
		};

		$scope.uploader.onProgressItem = function(fileItem, progress) {
			$scope.progress = progress;
		};

		$scope.uploader.onSuccessItem = function (item, response, status, header) {
			$scope.formSubmitted = false;
			$notifier.success('Document uploaded successfully');
			$scope.uploader.removeFromQueue(item);
			$app.goTo('admin.users.add');
			$scope.$close(true);
		};

		$scope.uploader.onErrorItem = function() {
			$scope.formSubmitted = false;
			$notifier.error("Something went wrong!");
		};
	});
