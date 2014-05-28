/*global angular */
'use strict';

/**
 * The main app module
 * @name app
 * @type {angular.Module}
 */
var dimsDemoConfig = function($routeProvider, $locationProvider) {
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
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
}

var dimsDemo = angular.module('dimsDemo', ['ngRoute','angularFileUpload','dimsDemo.controllers']).config(dimsDemoConfig);


