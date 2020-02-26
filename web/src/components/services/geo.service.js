'use strict';

/* jshint undef: false */

angular.module('app.components').factory('$geo', function($q, $geocoder) {

	return {
		codeAddress: function(address) {
			var deferred = $q.defer();
			if( ! $geocoder) {
				deferred.reject('Geocode was not successful for the following reason: Google maps geocoder API not included');
			} else {
				$geocoder.geocode( { 'address': address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						deferred.resolve(results);
					} else {
						deferred.reject('Geocode was not successful for the following reason: ' + status);
					}
				});
			}
			return deferred.promise;
		}
	};

});