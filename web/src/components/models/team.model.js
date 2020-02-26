'use strict';

angular.module('app.components.models')
    .run(function(Restangular) {
        var extension = function(team)
        {
            team.deactivateMember = function(member) {
                member.inactivated = !member.inactivated ? 1 : 0;
                team.one('members', member.id).put({inactivated: member.inactivated});
            };

            return team;
        };

        Restangular.extendModel('team', extension);
        Restangular.extendModel('teams', extension);
    });
