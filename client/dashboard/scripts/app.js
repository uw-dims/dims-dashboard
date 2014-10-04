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
  'maxFileUpload': 10,
  'SILK' : 'rwfind',
  'CIF' : 'cifbulk',
  'CORRELATE' : 'crosscor',
  'ANONYMIZE' : 'anon',
  'SOCKETIO_URL' : 'https://lpsrv1:3030'
};

var rpcClientOptions = {
  'searchFile' : {
    'flag': '-r',
    'short': true,
    'clients': [constants.ANON, constants.SILK, constants.CIF, constants.CORRELATE]
  },
  'mapFile': {
    'flag': '-m',
    'short': true,
    'clients': [constants.ANON, constants.CORRELATE]
  },
  'showJson': {
    'flag': '-J',
    'short': true,
    'clients': [constants.ANON, constants.SILK]
  },
  'showStats': {
    'flag': '-s',
    'short': true,
    'clients': [constants.ANON, constants.CIF, constants.CORRELATE]
  },
  'noHeader': {
    'flag': '-H',
    'short': true,
    'clients': [constants.SILK, constants.CIF]
  },
  'startTime': {
    'flag': '--stime=',
    'short': false,
    'clients': [constants.SILK, constants.CIF]
  },
  'endTime': {
    'flag': '--etime=',
    'short': false,
    'clients': [constants.SILK, constants.CIF]
  },
  'numDays': {
    'flag': '-D',
    'short': true,
    'clients': [constants.SILK, constants.CIF]
  },
  'hitLimit': {
    'flag': '-T',
    'short': true,
    'clients': [constants.SILK]
  },
  'friendFoe': {
    'flag': '-I',
    'short': true,
    'clients': [constants.CORRELATE]
  }
};



var dimsDashboard = angular.module('dimsDashboard', 
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','ngGrid', 'ngAnimate',
    'truncate', 'dimsDashboard.controllers', 'dimsDashboard.directives', 'dimsDashboard.services'])
  .config(dimsDashboardConfig);

dimsDashboard.constant(constants);
dimsDashboard.constant(rpcClientOptions);

angular.module('dimsDashboard.controllers', []);
angular.module('dimsDashboard.services', []);
angular.module('dimsDashboard.directives', []);
angular.module('dimsDashboard.filters', []);

