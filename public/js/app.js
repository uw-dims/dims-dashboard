/*global angular */
'use strict';

/**
 * The main app module
 * @name app
 * @type {angular.Module}
 */
var dimsDemoConfig = function($routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
  $routeProvider
  .when('/', {
    controller: 'MainController',
    templateUrl: 'partials/main.html'
  })
  .when('/uploadfile', {
    controller: 'UploadController',
    templateUrl: 'partials/upload.html'
  })
  .when('/ipgrep_client', {
    controller:'IpgrepController',
    templateUrl: 'partials/ipgrep.html'
  })
  .when('/anon_client', {
    controller: 'AnonController',
    templateUrl: 'partials/anon_client.html'
  }).when('/crosscor_client', {
    controller: 'CrosscorController',
    templateUrl: 'partials/crosscor_client.html'
  }).when('/cifbulk_client', {
    controller: 'CifbulkController',
    templateUrl: 'partials/cifbulk_client.html'
  }).when('/rwfind_client', {
    controller: 'RwfindController',
    templateUrl: 'partials/rwfind_client.html'
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
  datepickerConfig.minDate = '1960-01-01';
  datepickerConfig.showWeeks = false;
  datepickerPopupConfig.datepickerPopup = 'MM-dd-yyyy';
}

var dimsDemo = angular.module('dimsDemo', 
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','dimsDemo.controllers', 'dimsDemo.directives', 'dimsDemo.services'])
  .config(dimsDemoConfig);

dimsDemo.factory('dimsConfig', function() {
  var dimsConfig = {

  };
})

