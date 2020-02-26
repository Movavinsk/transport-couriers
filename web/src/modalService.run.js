'use strict';

angular.module('app')
	.run(function($rootScope, $state, $app, ModalService) {
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			if(isDefined(toState.modal) && toState.modal) {
				event.preventDefault();
				ModalService.openEdit(toState.templateUrl, toState.controller, toParams, isString(toState.modal) ? toState.modal : 'sm').result.then(function() {
					$app.reload();
				});
			}
		});
	});
