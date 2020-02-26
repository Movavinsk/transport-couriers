'use strict';

angular.module('app').controller('RecoverController', function($scope, $app, $state, $err, $auth, $notifier) {

	$scope.recover = function(email) {
		$err.tryPromise($auth.recover(email)).then(function() {
			$notifier.success('Reset password email has been sent.');
			$app.goTo('login');
		});
	};

	$scope.cancel = function() {
		$app.skipTo('login');
	};

});
