angular.module('app.components')
    .factory('$auth', function ($rootScope, $window, $q, $restAuth, $restApp, $app) {

        // Dummy guest user
        var cleanUser = {
            id: null,
            name_first: 'Guest',
            name_last: null,
            email: null,
            is_admin: false,
            name_full: 'Guest',
            ratings_count: 0,
            score: 0,
        };
        var guest = $.extend(true, {}, cleanUser);

        // By default user is guest
        var user = {};
        extend(user, guest);

        var bootstrap = false;

        return {
            user: function () {
                return user;
            },
            assure: function (callback) {
                if (bootstrap) {
                    callback();
                }
                else {
                    $rootScope.$on('auth.bootstrap', callback);
                }
            },
            bootstrapped: function () {
                return bootstrap;
            },
            toGuest: function () {
                user = this.createGuest();
            },
            createGuest: function () {
                return {
                    id: null,
                    name_first: 'Guest',
                    name_last: null,
                    email: null,
                    is_admin: false,
                    name_full: 'Guest',
                };
            },
            check: function () {
                var deferred = $q.defer();
                $restAuth.all('user').one('current').get().then(function (data) {
                    extend(user, guest, data);
                    if (!bootstrap) $rootScope.$broadcast('auth.bootstrap');
                    bootstrap = true;
                    deferred.resolve(user);
                }, function () {
                    if (!bootstrap) $rootScope.$broadcast('auth.bootstrap');
                    bootstrap = true;
                    deferred.reject();
                });

                return deferred.promise;
            },
            login: function (email, password) {
                var deferred = $q.defer();
                $restAuth.all('user').one('login').post(null, {
                    email: email,
                    password: password,
                }).then(function (data) {
                    $restAuth.all('user').one('current').get().then(function (data) {
                        extend(user, guest, data);
                        if (!bootstrap) $rootScope.$broadcast('auth.bootstrap');
                        bootstrap = true;
                        deferred.resolve(user);
                    }, function () {
                        if (!bootstrap) $rootScope.$broadcast('auth.bootstrap');
                        bootstrap = true;
                        deferred.reject();
                    });
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            logout: function () {
                var deferred = $q.defer();
                $restAuth.all('user').one('logout').get().then(function () {
                    extend(user, guest);
                    $rootScope.$broadcast('auth.logout', user);
                    deferred.resolve(user);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise;
            },
            recover: function (email) {
                var deferred = $q.defer();
                $restAuth.all('password').customPOST({ email: email }, 'recover').then(function (result) {
                    deferred.resolve(result);
                }, function (data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            reset: function (password, password_confirmation, token) {
                var deferred = $q.defer();
                $restAuth.all('password').customPOST({
                    password: password,
                    password_confirmation: password_confirmation,
                    token: token,
                }, 'reset').then(function (result) {
                    deferred.resolve(result);
                }, function (data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            register: function (user) {
                var deferred = $q.defer();
                $restAuth.all('users').post(user).then(function (result) {
                    deferred.resolve(result);
                }, function (data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            isGuest: function () {
                return !user.id; // Must not have an id
            },
            isUser: function () {
                return !!user.id; // Must have an id
            },
            isAdmin: function () {
                return !!user.is_admin;
            },
            isRegistered: function () {
                var deferred = $q.defer();
                $restApp.all('register').one('check').get().then(function (data) {
                    $rootScope.userRegistration = data;
                    deferred.resolve(data);
                }, function (data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
        };
    });
