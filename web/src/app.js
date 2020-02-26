'use strict';

angular.module('app', [
  'ngCookies',
  'ngSanitize',
  'ngAnimate',
  'ui.bootstrap',
  'ui.router',
  'ui.router.menus',
  'ui.select',
  'ui.utils',
  'restangular',
  'ngTable',
  'ngTableExport',
  'satellizer',
  'dialogs.main',
  'dialogs.default-translations',
  'ngStorage',
  'app.components',
  'app.components.models',
  'angularFileUpload',
  'ui.bootstrap-slider',
  'ui-rangeSlider',
  'uiGmapgoogle-maps',
  'ngImgCrop',
  'angular-flot',
  'angularMoment'
])
  .config(function ($locationProvider, $urlRouterProvider, $compileProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/login'); // @todo Angular app default should be login
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|tel):/); // Allow href tel links
  })
  .run(function ($rootScope, $app, $state, $auth) { // Perform app run tasks here

    // Apply $app to rootScope
    $rootScope.$app = $app;

    // Apply $state to rootScope
    $rootScope.$state = $state;

    $rootScope._ = _;

    // Apply $auth to rootScope
    $rootScope.$auth = $auth;

  });
