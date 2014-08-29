/*global angular */
'use strict';

/**
 * The main app module
 * @name app
 * @type {angular.Module}
 */
var dimsDashboardConfig = function($routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
  $routeProvider.when('/', {
    controller: 'MainCtrl',
    templateUrl: 'views/partials/main.html'
  }).
  when('/uploadfile', {
    controller: 'UploadCtrl',
    templateUrl: 'views/partials/upload.html'
  }).
  when('/datafiles', {
    controller: 'DataFilesCtrl',
    templateUrl: 'views/partials/data_files.html'
  }).
  when('/ipgrep_client', {
    controller:'IpgrepCtrl',
    templateUrl: '/views/partials/ipgrep.html'
  }).
  when('/anon_client', {
    controller: 'AnonCtrl',
    templateUrl: '/views/partials/anon_client.html'
  }).
  when('/crosscor_client', {
    controller: 'CrosscorCtrl',
    templateUrl: '/views/partials/crosscor_client.html'
  }).
  when('/cifbulk_client', {
    controller: 'CifbulkCtrl',
    templateUrl: '/views/partials/cifbulk_client.html'
  }).
  when('/rwfind_client', {
    controller: 'RwfindCtrl',
    templateUrl: 'views/partials/rwfind_client.html'
  }).
  when('/graph', {
    controller: 'GraphCtrl',
    templateUrl: 'views/partials/graph.html'
  }).
  otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
  // Datepicker configurations
  datepickerConfig.minDate = '1960-01-01';
  datepickerConfig.showWeeks = false;
  datepickerPopupConfig.datepickerPopup = 'MM-dd-yyyy';
};

var constants = {
  'fileSources': ['ip_lists', 'map_files', 'data_files', 'default_data'],
  'fileSourceMap': [
      { value: 'ip_lists', label: 'List of IPs, CIDR, or Domains' },
      { value: 'map_files', label: 'Mapping Files' },
      { value: 'data_files', label: 'Uploaded Data Files' },
      { value: 'default_data', label: 'Default Sample Data' }
    ],
  'fileDestinations': ['ip_lists', 'map_files', 'data_files'],
  'fileDestinationMap': [
      { value: 'ip_lists', label: 'List of IPs, CIDR, or Domains' },
      { value: 'map_files', label: 'Mapping Files' },
      { value: 'data_files', label: 'Any Data Files' }
    ] ,
  'maxFileUpload': 10
};

var dimsDashboard = angular.module('dimsDashboard', 
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','ngGrid', 'truncate', 'dimsDashboard.controllers', 'dimsDashboard.directives', 'dimsDashboard.services'])
  .config(dimsDashboardConfig);

dimsDashboard.constant(constants);

angular.module('dimsDashboard.controllers', []);
angular.module('dimsDashboard.services', []);
angular.module('dimsDashboard.directives', []);
angular.module('dimsDashboard.filters', []);

