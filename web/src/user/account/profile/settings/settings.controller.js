'use strict';

angular
    .module('app')
    .controller('UserProfileSettingsController', SettingsController);

SettingsController.$inject = ["$location", "$scope", "$auth", "$restUser", "$err", '$notifier', '$restApp'];

function SettingsController($location, $scope, $auth, $restUser, $err, $notifier, $restApp) {

    // @TODO centralize settings
    $scope.settings = {
        vehicle_type: [
            {label: 'All Vehicles Sizes', value: 'all'},
            // {label: 'My vehicle sizes and Smaller', value: 'vehicle_and_lower'},
            {label: 'My vehicles only', value: 'vehicle_only'},
            {label: 'Custom scale', value: 'custom'}
        ],
        location: [
            {label: 'My Locations Only', value: 'location_only'},
            {label: 'All Locations', value: 'all'},
        ]
    };

    $err.tryPromise($restApp.all('vehicles').getList({'sorting[size]': "asc"}))
        .then(function(vehicles) {
            $scope.min = vehicles[0].size;
            $scope.max = vehicles[vehicles.length - 1].size;
            $scope.vehicles = vehicles;
        })

    $auth.assure(function() {
        $scope.user_id = $auth.user().id;
        $err.tryPromise($restUser.one('profile', $scope.user_id).get())
            .then(function (data) {
                if (! data.settings.custom_min)
                    data.settings.custom_min = 0;
                 if (! data.settings.custom_max) {
                    data.settings.custom_max = $scope.vehicles.length * 100;
                }
                $scope.data = data;
            })
    })

    $scope.update = function() {
        $scope.formSubmitted = true;
        $err.tryPromise($scope.data.put())
            .then(function(response) {
                $scope.formSubmitted = false;
                $auth.check().then(function () {
                    $notifier.success('Settings updated correctly.');
                })
            })
            .catch(function(response) {
                $scope.formSubmitted = false;
                $notifier.error('There were problems updating your settings.');
            })
    }

}