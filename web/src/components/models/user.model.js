'use strict';

angular.module('app.components.models')
  .run(function (Restangular) {
    var extension = function (model) {
      model.can = function (checkedPermission) {
        for (var i = 0; i < this.roles.length; i++) {
          var has = this.roles[i].perms.filter(function (perm) {
            return perm.name == checkedPermission;
          });
          if (has.length) {
            return true;
          }
        }

        return false;
      };

      model.hasRole = function (checkedRole) {
        return this.filterRolesByName(checkedRole).length;
      };

      model.filterRolesByName = function (checkedName) {
        return this.roles.filter(function (role) {
          return role.name == checkedName;
        });
      };

      model.attachRole = function (role) {
        model.roles.push(role);
        model.roles_ids.push(role.id);
      };

      model.detachRole = function (role) {
        this.roles.splice(_.findIndex(this.roles, {id: role.id}), 1);
        this.roles_ids.splice(this.roles_ids.indexOf(role.id), 1);
      };

      model.getAvatar = function () {
        return this.avatar_url;
      }

      return model;
    };

    Restangular.extendModel('current', extension);
    Restangular.extendModel('users', extension);
  });