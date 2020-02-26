angular.module('app.components').directive('googleplace', function () {
  return {
    restrict: 'AE',
    require: 'ngModel',
    scope: {
      ngModel: '=',
      details: '=?',
      lat: '=?',
      lng: '=?'
    },
    replace: true,
    link: function (scope, element, attrs, model) {

      var options = {
        types: [],
      };
      var autocomplete = new google.maps.places.Autocomplete(element[0], options);

      google.maps.event.addListener(autocomplete, 'place_changed', function () {

        var place = autocomplete.getPlace();

        if (place && place.geometry) {
          scope.details = place;
          model.$setViewValue(element.val());
          scope.lat = place.geometry.location.lat();
          scope.lng = place.geometry.location.lng();

          element.trigger("blur");
          scope.$apply();
        } else {
          var geocoder = new google.maps.Geocoder();
          var address = element.val() + ", UK";

          geocoder.geocode({'address': address}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              place = results[0];
              scope.details = place;
              model.$setViewValue(element.val());
              scope.lat = place.geometry.location.lat();
              scope.lng = place.geometry.location.lng();
              element.trigger("blur");
              scope.$apply();
            } else {
              alert("Autocomplete's returned place contains no geometry");
              return;
            }
          });
        }
      });

      //element.on("blur", function() {
      //  if(!scope.lat && !scope.lng) google.maps.event.trigger(autocomplete, 'place_changed');
      //});

      element.on("keydown change", function () {
        element.closest(".form-group").removeClass("has-error").find(".label-danger").remove();
      });
    }
  };
});