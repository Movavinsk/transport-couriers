'use strict';

angular.module('app.components').directive("verifyAddress", function($geo) {
	return {
		restrict: "A",
		require: "ngModel",
		link: function(scope, element, attributes, ngModel) {
			ngModel.$asyncValidators.verifyAddress = function(modelValue) {
				return $geo.codeAddress(modelValue);
			}
		}
	};
});
