'use strict';

angular.module('app')
.controller('AdminSettingsEmailController', function($scope, $restAdmin, $err, $app, $notifier) {

	$scope.data = {};

	$err.tryPromise($restAdmin.one('settings', 'mail').get()).then(function(data) {
		$scope.data = data;
	});

	$scope.store = function() {
		$err.tryPromise($restAdmin.all('settings').post($scope.data)).then(function() {
			$notifier.success('Settings updated');
		});
	};

	$scope.cancel = function() {
		$app.reload();
	};

});
