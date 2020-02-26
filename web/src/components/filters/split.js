angular.module('app.components').filter('split', function() {
    return function(input, splitChar, splitIndex) {
      if(!input) return;

      if(splitIndex == 'last') {
        var splitText = input.split(splitChar);
        return splitText[splitText.length - 1];
      }else {
        return input.split(splitChar)[splitIndex];
      }
    }
  });