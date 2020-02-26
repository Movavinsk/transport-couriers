'use strict';

angular.module('app')
  .factory('restErrorInterceptor', function () {
    function isLaravelValidation(response) {
      var l5validation = false;

      if (typeof response.data === 'string') {
        return false;
      }

      $.each(response.data, function (index) {
        if (typeof response.data[index] == 'object') {
          l5validation = true;
        }
        return false;
      });

      return l5validation;
    }

    function extractMessage(response) {
      return $.map(response.data, function (messages) {
        return messages.join("<br/>");
      }).join("<br/>");
    }

    function pushNormalError($err, lastRequest, response) {
      if (!isDefined(response.data.messages) && isLaravelValidation(response)) {
        var message = extractMessage(response);
      }
      else {
        var message = (isDefined(response.data.messages) ? response.data.messages : response.statusText);
      }

      $err.error(lastRequest, message, response);
    }

    return {
      intercept: function (lastRequest, $err, $rootScope, response) {
        if (response.status == 422) {
          $err.error(lastRequest, (isDefined(response.data) ? JSON.stringify(response.data) : response.statusText), response);
        }
        else {
          pushNormalError($err, lastRequest, response);
        }
      },
      userIntercept: function (lastRequest, $err, $rootScope, response) {
        if (response.status == 401) {
          $rootScope.$broadcast('guard.out', extractMessage(response));
        } else {
          this.intercept.apply(this, arguments);
        }
      }
    }
  })
  .config(function (RestangularProvider) {
    RestangularProvider.setDefaultHeaders({'X-Requested-With': 'XMLHttpRequest'});

    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
      var extractedData;
      extractedData = isDefined(data.data) ? data.data : [];
      extractedData.paginator = isDefined(data.paginator) ? data.paginator : [];
      extractedData.messages = isDefined(data.messages) ? data.messages : [];
      extractedData.properties = isDefined(data.properties) ? data.properties : [];
      return extractedData;
    });
  })
  // @todo Use decorator pattern to reduce duplicate LOC
  .factory('$restAuth', function (Restangular, $err, restErrorInterceptor, $rootScope) {
    return Restangular.withConfig(function (RestangularConfigurer) {

      RestangularConfigurer.setBaseUrl('/api/auth');

      var lastRequest = null;
      RestangularConfigurer.addRequestInterceptor(function (element, operation, what, url) {
        lastRequest = operation + ' | ' + url;
        $err.clearLast();
        return element;
      });

      RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.intercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));

    });
  })
  .factory('$restAdmin', function (Restangular, $err, restErrorInterceptor, $rootScope) {
    return Restangular.withConfig(function (RestangularConfigurer) {

      RestangularConfigurer.setBaseUrl('/api/admin');

      var lastRequest = null;
      RestangularConfigurer.addRequestInterceptor(function (element, operation, what, url) {
        lastRequest = operation + ' | ' + url;
        $err.clearLast();
        return element;
      });

      RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));

    });
  })
  .factory('$restUser', function (Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function (RestangularConfigurer) {

      RestangularConfigurer.setBaseUrl('/api/user');

      var lastRequest = null;
      RestangularConfigurer.addRequestInterceptor(function (element, operation, what, url) {
        lastRequest = operation + ' | ' + url;
        $err.clearLast();
        return element;
      });

      RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));

    });
  })
  .factory('$restDirectory', function (Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function (RestangularConfigurer) {

      RestangularConfigurer.setBaseUrl('/api/directory');

      var lastRequest = null;
      RestangularConfigurer.addRequestInterceptor(function (element, operation, what, url) {
        lastRequest = operation + ' | ' + url;
        $err.clearLast();
        return element;
      });

      RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));

    });
  })
  .factory('$restApp', function (Restangular, $err, $rootScope, restErrorInterceptor) {
    return Restangular.withConfig(function (RestangularConfigurer) {

      RestangularConfigurer.setBaseUrl('/api');

      var lastRequest = null;
      RestangularConfigurer.addRequestInterceptor(function (element, operation, what, url) {
        lastRequest = operation + ' | ' + url;
        return element;
      });

      RestangularConfigurer.setErrorInterceptor(restErrorInterceptor.userIntercept.bind(restErrorInterceptor, lastRequest, $err, $rootScope));
    });
  });
