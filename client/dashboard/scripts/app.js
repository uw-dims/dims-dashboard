/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/*global angular */
'use strict';

var dimsDashboardConfig = function ($routeProvider, $locationProvider, datepickerConfig, datepickerPopupConfig) {
  $routeProvider.when('/', {
    controller: 'MainCtrl as vm',
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
  when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'views/partials/login.html'
  }).
  when('/viewstatus', {
    controller: 'SystemStatusCtrl',
    templateUrl: 'views/partials/systemstatus.html'
  }).
  when('/updatesystem', {
    controller: 'SystemUpdateCtrl',
    templateUrl: 'views/partials/systemupdate.html'
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
    'health': {
      'name': 'health',
      'event': 'health:data'
    },
    'devops': {
      'name': 'devops',
      'event': 'devops:data'
    },
    'test': {
      'name': 'test',
      'event': 'test:data'
    },
    'dimstr': {
      'name': 'dimstr',
      'event': 'dimstr:data'
    }
  },
  'logoURL': 'images/default/UW-logo.png',
  'consulUrl': 'http://10.142.29.117:8500/ui/#/dc1/nodes',
  'tridentUrl': 'https://demo.trident.li/'
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

var constExternalSites = [{
    externalKey: 'consul',
    siteName: 'CONSUL',
    siteURL: constants.consulUrl,
    canDelete: false
  }, {
    externalKey: 'trident',
    siteName: 'TRIDENT',
    siteURL: constants.tridentUrl,
    canDelete: false
  }
];

var dimsDashboard = angular.module('dimsDashboard',
  ['ngRoute', 'angularFileUpload', 'ui.bootstrap', 'ui.bootstrap.showErrors', 'ngGrid', 'ngAnimate', 'ngResource',
    'http-auth-interceptor', 'btford.socket-io', 'ngSanitize', 'ngCookies', 'anguFixedHeaderTable', 'truncate',
    'msieurtoph.ngCheckboxes', 'dimsDashboard.controllers', 'dimsDashboard.directives', 'dimsDashboard.services', 'dimsDashboard.config'])
  .config(dimsDashboardConfig);

dimsDashboard.constant(constants);
dimsDashboard.constant(rpcClientOptions);
dimsDashboard.constant(constExternalSites);

// This is populated by Grunt
angular.module('dimsDashboard.config', []);
angular.module('dimsDashboard.controllers', []);
angular.module('dimsDashboard.services', []);
angular.module('dimsDashboard.directives', []);
angular.module('dimsDashboard.filters', []);

dimsDashboard.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });

 _.mixin(_.string.exports());

dimsDashboard.run(function ($rootScope, $location, $log, AuthService, ThemeService) {

  // $cookies.currentTheme = $cookies.currentTheme || ENV.DASHBOARD_DEFAULT_THEME;
  // console.log('current theme now', $cookies.currentTheme);
  // var styleLinks = document.getElementsByTagName('link');
  // console.log(styleLinks);
  // _.forEach(styleLinks, function (link) {
  //   if (link.href && link.href.indexOf('styles/') !== -1) {
  //     link.disabled = (link.href.indexOf($cookies.currentTheme) === -1);
  //   }
  // });

  ThemeService.initializeTheme();
  //watching the value of the currentUser variable.
  $rootScope.$watch('currentUser', function (currentUser) {

    // socialauth path - returned from social login
    if (!currentUser && (['/socialauth'].indexOf($location.path()) === 0)) {
      AuthService.onSocialLogin($location.$$search);

    // No currentUser and  not on login page
    // Try to get the currentUser since might be a reload
    } else if (!currentUser && (['/login'].indexOf($location.path()) === -1)) {
      AuthService.currentUser();

    // Login page
    } else if (['/login'].indexOf($location.path()) === 0) {
      $location.path('/login');
    }
  });

  // On catching 401 errors, redirect to the login page.
  $rootScope.$on('event:auth-loginRequired', function () {
    $location.path('/login');
    return false;
  });


});


