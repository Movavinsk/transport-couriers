'use strict';

angular.module('app')
.controller('UserJobsBidsController', function ($q, $scope, $state, modalParams, ngTableParams, $restUser, $restApp, $notifier, $app, $err) {

		if( ! modalParams.job_id ) return;

	    $scope.loading = true;

		$scope.job_id = modalParams.job_id || null;

		$err.tryPromise($restUser.one('jobs', $scope.job_id).get()).then(function(data) {
			$scope.job = data;
		});

		$scope.tableParams = new ngTableParams(
			{
				page: 1,
				count: 10,
				sorting: {
					bid_date: 'desc'
				},
				filter: {
					job_id: $scope.job_id
				}
			}, {
			total: 0,
			getData: function ($defer, params)
			{
				$err.tryPromise($restUser.all('bids').getList(params.url())).then(function (result) {
			        $scope.loading = false;
					$scope.tableParams.settings({total: result.paginator.total});
					$defer.resolve(result);
				});
			}
		});
});
