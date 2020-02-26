'use strict';

angular.module('app')
  .controller('AppController', function ($scope, $app, $window, $moment) {

    function isSmartDevice($window) {
      var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
      return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
    }

    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass('ie');

    isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

    $app.name = 'SDCN';
    $app.version = '0.0.1';
    $app.year = $moment().format('YYYY');

    // for chart colors
    $app.color = {
      primary: '#063f60',
      secondary: '#1298e6',
      info: '#23b7e5',
      success: '#27c24c',
      warning: '#fad733',
      danger: '#f05050',
      light: '#e8eff0',
      dark: '#3a3f51',
      black: '#1c2b36'
    };

    $app.settings = {
      themeID: 1,
      navbarHeaderColor: 'bg-primary',
      navbarCollapseColor: 'bg-white-only',
      asideColor: 'bg-primary',
      headerFixed: false,
      asideFixed: false,
      asideFolded: false,
      asideDock: false,
      container: false
    };

    $app.isSmartDevice = isSmartDevice($window);
  });
