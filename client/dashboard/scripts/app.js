/*global angular */
'use strict';

var dimsDashboardConfig = function ($routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
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
    controller: 'IpgrepCtrl',
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
  when('/userinfo', {
    controller: 'UserInfoCtrl',
    templateUrl: 'views/partials/userinfo.html'
  }).
  when('/userinfo/:type', {
    controller: 'UserInfoCtrl',
    templateUrl: 'views/partials/userinfo.html'
  }).
  when('/users', {
    controller: 'UserCtrl as vm',
    templateUrl: '/views/partials/users.html'
  }).
  when('/logmonitor', {
    controller: 'LogMonitorCtrl as vm',
    templateUrl: 'views/partials/logmonitormain.html'
  }).
  when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'views/partials/login.html'
  }).
  when('/mainnew', {
    controller: 'MainnewCtrl',
    templateUrl: 'views/partials/mainnew.html'
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
    ],
  'maxFileUpload': 10,
  'SILK' : 'rwfind',
  'CIF' : 'cifbulk',
  'CORRELATE' : 'crosscor',
  'ANONYMIZE' : 'anon',
  'PASS_SECRET' : '84jd$#lk903jcy2AUEI2j4nsKLJ!lIY',
  'chatExchanges': {
    'chat': {
      'name': 'chat',
      'event': 'chat:data',
      'sendEvent': 'chat:client'
    }
  },
  'fanoutExchanges': {
    'logs': {
      'name': 'logs',
      'event': 'logs:data'
    },
    'devops': {
      'name': 'devops',
      'event': 'devops:data'
    },
    'test': {
      'name': 'test',
      'event': 'test:data'
    },
    'health': {
      'name': 'health',
      'event': 'health:data'
    },
    'dimstr': {
      'name': 'dimstr',
      'event': 'dimstr:data'
    }
  }
  //'logExchange': 'devops',
  //'chatExchange': 'chat',
  //'logEvent': 'devops:data',
  //'chatEvent': 'chat:data'
};

var rpcClientOptions = {
  'searchFile' : {
    'flag': '-r',
    'short': true,
    'clients': [constants.ANONYMIZE, constants.SILK, constants.CIF, constants.CORRELATE]
  },
  'mapFile': {
    'flag': '-m',
    'short': true,
    'clients': [constants.ANONYMIZE, constants.CORRELATE]
  },
  'showJson': {
    'flag': '-J',
    'short': true,
    'clients': [constants.ANONYMIZE, constants.SILK]
  },
  'showStats': {
    'flag': '-s',
    'short': true,
    'clients': [constants.ANONYMIZE, constants.CIF, constants.CORRELATE]
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
  ['ngRoute','angularFileUpload','ui.bootstrap','ui.bootstrap.showErrors','ngGrid', 'ngAnimate', 'ngResource','http-auth-interceptor', 'btford.socket-io',
    'ngCookies','anguFixedHeaderTable', 'truncate', 'dimsDashboard.controllers', 'dimsDashboard.directives', 'dimsDashboard.services','dimsDashboard.config'])
  .config(dimsDashboardConfig);

dimsDashboard.constant(constants);
dimsDashboard.constant(rpcClientOptions);

// This is populated by Grunt
angular.module('dimsDashboard.config',[]);
angular.module('dimsDashboard.controllers', []);
angular.module('dimsDashboard.services', []);
angular.module('dimsDashboard.directives', []);
angular.module('dimsDashboard.filters', []);

 _.mixin(_.string.exports());

dimsDashboard.run(function($rootScope, $location, $log, AuthService) {
  //watching the value of the currentUser variable.
  $rootScope.$watch('currentUser', function(currentUser) {
    // if no currentUser and on a page that requires authorization then try to update it
    // will trigger 401s if user does not have a valid session
    $log.debug('Run: watch currentUser handler. currentUser is ',currentUser);
    $log.debug('Run: watch currentUser handler. path is ', $location.path());
    if (!currentUser && (['/login'].indexOf($location.path()) === -1 )) {
      $log.debug('Run: watch currentUser handler. First if. No currentUser and not on login page. Call AuthService.currentUser()');
      AuthService.currentUser();
    } else if (['/login'].indexOf($location.path()) === 0 ) {
      $log.debug('Run: watch currentUser handler. 2nd if. currentUser is ', currentUser);
      $log.debug('Run: watch currentUser handler. 2nd if. location ', $location.path());
      $location.path('/login');
    } else {
      $log.debug('Run: watch currentUser handler. else. currentUser is ', currentUser);
      $log.debug('Run: watch currentUser handler. else. location ', $location.path());
    }
  });

  // On catching 401 errors, redirect to the login page.
  $rootScope.$on('event:auth-loginRequired', function() {
    $log.debug('Run: auth-loginRequired event handler. Caught 401, redirect to login page');
    $location.path('/login');
    return false;
  });
});


