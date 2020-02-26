'use strict';

angular.module('app.components').directive("matchTo", function($parse) {
	return {
		require: '?ngModel',
		restrict: 'A',
		link: function(scope, elem, attrs, ctrl) {
			if(!ctrl) {
				if(console && console.warn){
					console.warn('`matchTo` validation requires ngModel to be on the element');
				}
				return;
			}

			var matchToGetter = $parse(attrs.matchTo);

			scope.$watch(getMatchToValue, function(){
				ctrl.$$parseAndValidate();
			});

			ctrl.$validators.matchTo = function(){
				return ctrl.$viewValue === getMatchToValue();
			};

			function getMatchToValue(){
				var matchTo = matchToGetter(scope);
				if(angular.isObject(matchTo) && matchTo.hasOwnProperty('$viewValue')){
					matchTo = matchTo.$viewValue;
				}
				return matchTo;
			}
		}
	};
});
