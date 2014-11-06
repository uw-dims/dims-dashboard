/*global angular */
'use strict';

var dimsDashboardConfig = function($provide, $routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
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
  when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'views/partials/login.html'
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
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','ngGrid', 'ngAnimate', 'ngResource', 'http-auth-interceptor',
    'ngCookies','btford.socket-io','truncate', 'dimsDashboard.controllers', 'dimsDashboard.directives', 'dimsDashboard.services'])
  .config(dimsDashboardConfig);

dimsDashboard.constant(constants);
dimsDashboard.constant(rpcClientOptions);

angular.module('dimsDashboard.controllers', []);
angular.module('dimsDashboard.services', []);
angular.module('dimsDashboard.directives', []);
angular.module('dimsDashboard.filters', []);

dimsDashboard.run(function($rootScope, $location, $log, AuthService, SettingsService) {
  //watching the value of the currentUser variable.
  $rootScope.$watch('currentUser', function(currentUser) {
    // if no currentUser and on a page that requires authorization then try to update it
    // will trigger 401s if user does not have a valid session
    $log.debug('Run: watch currentUser handler. currentUser is ',currentUser);
    $log.debug('Run: watch currentUser handler. path is ', $location.path());
    if (!currentUser && (['/login'].indexOf($location.path()) == -1 )) {
      $log.debug('Run: watch currentUser handler. No currentUser and not on login page. Call AuthService.currentUser()');
      AuthService.currentUser();
    }
  });

  // On catching 401 errors, redirect to the login page.
  $rootScope.$on('event:auth-loginRequired', function() {
    $log.debug('Run: auth-loginRequired event handler. Caught 401, redirect to login page');
    $location.path('/login');
    return false;
  });
});


