angular.module('app.components').directive('sdcnLoader', ['$http', function ($http) {
  return {
    restrict: 'EA',
    templateUrl: 'src/components/directives/sdcn.loader.html',
    replace: true,
    scope: {
      size: "@"
    }
  }
}]);