'use strict';

angular.module('app')
	.controller('UserJobsNotesController', function ($q, $scope, $state, modalParams, $restUser, $restApp, $notifier, $app, $err, $moment, $auth, $stateParams) {

	    if( ! modalParams.job_id ) return;

	    $scope.job_id = modalParams.job_id || null;
	    $scope.notes = modalParams.notes || "No notes available";
        $scope.bid_details = modalParams.bid_details || "No job details available";
	    $scope.loading = false;
	    $scope.date = $moment().format();

	});
