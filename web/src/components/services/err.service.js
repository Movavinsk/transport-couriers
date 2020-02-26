'use strict';

/* jshint undef: false */

angular.module('app.components').factory('$err', function($q, $notifier) {

	var lastError = null;

	var errors = [];

	return {
		error: function(source, description, data) {
			lastError = {
				source: source,
				description: description,
				data: data
			};
			errors.push(lastError);
		},
		lastError: function() {
			return lastError;
		},
		errors: function() {
			return errors;
		},
		clearLast: function() {
			lastError = null;
		},
		clearAll: function() {
			errors.length = 0;
		},
		tryFn: function(fn, options) {
			var notify = isDefined(options) && isDefined(options.notify) ? options.notify : true;
			fn();
			if(lastError !== null) {
				notify && $notifier.error(lastError.description);
				lastError = null;
			}
		},
		tryPromise: function(promise, options) {
			var notify = isDefined(options) && isDefined(options.notify) ? options.notify : true;
			var notifyFormatter = isDefined(options) && isDefined(options.notifyFormatter) ? options.notifyFormatter : function(error) {
				return isDefined(error.description) && isArray(error.description) ? error.description.join('<br/>') : error.description;
			};
			var deferred = $q.defer();
			promise.then(function(data) {
				deferred.resolve(data);
				if(lastError !== null) { // Check lastError even in success leg
					notify && $notifier.error(notifyFormatter(lastError)); // Notify only description
					lastError = null;
				}
			}, function(data) {
				deferred.reject(data);
				if(lastError !== null) { // Check lastError in failure leg also
					notify && $notifier.error(notifyFormatter(lastError)); // Notify only description
					lastError = null;
				}
			});
			return deferred.promise;
		}
	};

});
