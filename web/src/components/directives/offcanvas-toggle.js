angular.module('app.components').directive('offcanvasToggle', ['$http', function ($http) {
  return {
    restrict: 'A',
    scope: {},
    link: function (scope, element) {
      element.on("click", function() {
        $('.row-offcanvas').toggleClass('active');
      });
    }
  }
}]);