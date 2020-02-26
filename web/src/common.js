'use strict';

/* jshint unused: false */

var isDefined = angular.isDefined,
	isUndefined = angular.isUndefined,
	isFunction = angular.isFunction,
	isString = angular.isString,
	isObject = angular.isObject,
	isArray = angular.isArray,
	forEach = angular.forEach,
	extend = angular.extend,
	copy = angular.copy,
	equals = angular.equals,
	noop = angular.noop,
	identity = angular.identity,
	isDate = angular.isDate;

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value) {
	try {
		return decodeURIComponent(value);
	} catch(e) {
		// Ignore any invalid uri component
	}
}

/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
	return encodeURIComponent(val).
		replace(/%40/gi, '@').
		replace(/%3A/gi, ':').
		replace(/%24/g, '$').
		replace(/%2C/gi, ',').
		replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
	return encodeUriQuery(val, true).
		replace(/%26/gi, '&').
		replace(/%3D/gi, '=').
		replace(/%2B/gi, '+');
}

/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue) {
	var obj = {}, key_value, key;
	forEach((keyValue || '').split('&'), function(keyValue) {
		if ( keyValue ) {
			key_value = keyValue.replace(/\+/g,'%20').split('=');
			key = tryDecodeURIComponent(key_value[0]);
			if ( isDefined(key) ) {
				var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
				if (!hasOwnProperty.call(obj, key)) {
					obj[key] = val;
				} else if(isArray(obj[key])) {
					obj[key].push(val);
				} else {
					obj[key] = [obj[key],val];
				}
			}
		}
	});
	return obj;
}

function toKeyValue(obj) {
	var parts = [];
	forEach(obj, function(value, key) {
		if (isArray(value)) {
			forEach(value, function(arrayValue) {
				parts.push(encodeUriQuery(key, true) +
					(arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
			});
		} else {
			parts.push(encodeUriQuery(key, true) +
				(value === true ? '' : '=' + encodeUriQuery(value, true)));
		}
	});
	return parts.length ? parts.join('&') : '';
}

function flattenParams(params) {
	var parts = {};
	for (var key in params) {
		if (params.hasOwnProperty(key)) {
			var item = params[key],
				name = encodeURIComponent(key);
			if (typeof item === "object") {
				for (var subkey in item) {
					if (!isUndefined(item[subkey]) && item[subkey] !== "") {
						var pname = name + "[" + encodeURIComponent(subkey) + "]";
						parts[pname] = item[subkey];
					}
				}
			} else if (!isFunction(item) && !isUndefined(item) && item !== "") {
				parts[name] = + encodeURIComponent(item);
			}
		}
	}
	return parts;
}

function chunk(arr, size) {
	var newArr = [];
	for (var i = 0; i < arr.length; i+= size) {
		newArr.push(arr.slice(i, i + size));
	}
	return newArr;
}

/**
 * Get miles from meters
 *
 * @param i
 * @returns {Number}
 */
function getMiles(i) {
	return (i*0.000621371192).toFixed(2);
}

/**
 * Get meters from miles
 *
 * @param i
 * @returns {Number}
 */
function getMeters(i) {
	return parseInt(i*1609.344);
}