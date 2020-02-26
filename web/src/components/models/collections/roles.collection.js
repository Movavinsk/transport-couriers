'use strict';

angular.module('app.components.models')
  .run(function (Restangular) {
    Restangular.extendCollection('roles', function (collection) {
      collection.byName = function (name) {
        return collection.filter(function (role) {
          return role.name == name;
        })[0];
      };

      return collection;
    });
  });
