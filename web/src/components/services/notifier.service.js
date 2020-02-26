'use strict';

/* jshint undef: false */

angular.module('app.components').value('$toastr', toastr);

angular.module('app.components').factory('$notifier', function($toastr) {

	function init(type) {
		return function(msg, options) {
			type = type || 'success';
			$toastr.options = angular.extend({ positionClass: 'toast-bottom-right'}, options);
			$toastr[type](msg);
		};
	}

	return {
		info: init('info'),
		success: init('success'),
		warning: init('warning'),
		error: init('error')
	};
});
