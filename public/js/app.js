/*global angular */
'use strict';

/**
 * The main app module
 * @name app
 * @type {angular.Module}
 */
var dimsDemoConfig = function($routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
  $routeProvider.when('/', {
    controller: 'MainCtrl',
    templateUrl: 'partials/main.html'
  }).
  when('/uploadfile', {
    controller: 'UploadCtrl',
    templateUrl: 'partials/upload.html'
  }).
  when('/datafiles', {
    controller: 'DataFilesCtrl',
    templateUrl: 'partials/data_files.html'
  }).
  when('/ipgrep_client', {
    controller:'IpgrepCtrl',
    templateUrl: 'partials/ipgrep.html'
  }).
  when('/anon_client', {
    controller: 'AnonCtrl',
    templateUrl: 'partials/anon_client.html'
  }).
  when('/crosscor_client', {
    controller: 'CrosscorCtrl',
    templateUrl: 'partials/crosscor_client.html'
  }).
  when('/cifbulk_client', {
    controller: 'CifbulkCtrl',
    templateUrl: 'partials/cifbulk_client.html'
  }).
  when('/rwfind_client', {
    controller: 'RwfindCtrl',
    templateUrl: 'partials/rwfind_client.html'
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
  // Datepicker configurations
  datepickerConfig.minDate = '1960-01-01';
  datepickerConfig.showWeeks = false;
  datepickerPopupConfig.datepickerPopup = 'MM-dd-yyyy';
}

var dimsDemo = angular.module('dimsDemo', 
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','ngGrid','ng-prettyjson','dimsDemo.controllers', 'dimsDemo.directives', 'dimsDemo.services'])
  .config(dimsDemoConfig);

dimsDemo.factory('dimsConfig', function() {
  var dimsConfig = {

  };
})

