'use strict';

angular.module('app.components').filter('checkmark', function() {
	return function(input) {
		return input ? '\u2713' : '\u2718';
	};
});
