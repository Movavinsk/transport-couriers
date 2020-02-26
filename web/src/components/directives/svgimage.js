angular.module('app.components').directive('svgImage', ['$http', function ($http) {
  return {
    restrict: 'AE',
    scope: {
      ngSrc: "=?"
    },
    link: function (scope, element) {
      var imgURL = scope.ngSrc;

      var request = $http.get(
        imgURL,
        {'Content-Type': 'application/xml'}
      );

      scope.manipulateImgNode = function (data, elem) {
        var $svg = angular.element(data)[4];
        var imgClass = elem.attr('class');

        if (typeof(imgClass) !== 'undefined') {
          $svg.setAttribute("class", imgClass);
        }

        $svg.removeAttribute('xmlns:a');

        return $svg;
      };

      request.success(function (data) {
        element.replaceWith(scope.manipulateImgNode(data, element));
      });
    }
  }
}]);