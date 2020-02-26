'use strict';

angular.module('app')
	.controller('AdminJobsBidsEditController', function ($q, $scope, $state, modalParams, $restAdmin, $restApp, $notifier, $app, $err, $moment) {

		$scope.job_id = modalParams.job_id || null;
		$scope.bid_id = modalParams.bid_id || null;

		$scope.mode = 'Loading...';

		$scope.isAdd = function () {
			return $scope.bid_id === null;
		};

		$scope.isEdit = function () {
			return $scope.bid_id !== null;
		};

		$scope.data = {
			job_id: $scope.job_id
		};

		if ($scope.isAdd()) {
			$scope.mode = 'Add';
      $scope.data.bid_date = $moment().toDate();
		}
		else {
			$err.tryPromise($restAdmin.one('bids', $scope.bid_id).get()).then(function (data) {
				$scope.mode = 'Edit';
				$scope.data = data;
        $scope.data.amount = parseFloat(data.amount);
			});
		}

		$scope.store = function () {
			$err.tryPromise($restAdmin.all('bids').post($scope.data)).then(function () {
				$scope.$close(true);
			});
		};

		$scope.update = function () {
			$err.tryPromise($scope.data.put()).then(function () {
				$scope.$close(true);
			});
		};

		$scope.destroy = function () {
			$err.tryPromise($scope.data.remove()).then(function () {
				$scope.$close(true);
			});
		};

		$scope.cancel = function () {
			$scope.$dismiss();
		};

		$scope.$watch('data.user_id', function(newValue) {
			$err.tryPromise($restAdmin.one('users', newValue).get()).then(function(data) {
				$scope.user = data;
			});
		})

	});