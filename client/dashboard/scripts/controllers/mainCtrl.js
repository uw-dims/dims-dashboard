'use strict';
angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', 'LogService','ChatService','$cookies','$location', '$routeParams', '$log', '$filter', '$http', 'SettingsService','$rootScope',
      function ($scope, LogService, ChatService, $cookies, $location, $routeParams, $log, $filter, $http, SettingsService, $rootScope) {
    // write Ctrl here
    $log.debug('In MainCtrl');

    $scope.settings = SettingsService.get();
    $scope.settingsFormData = SettingsService.get();

    $scope.isCollapsed = true;
    $scope.showTools = false;
    $scope.showSavedQueries = false;
    $scope.showActivities = false;
    // $scope.logmonOn = false;
    $scope.logs = [];
    $scope.currentSelectedQuery = {};
    $scope.currentSelectedTool = {};
    // $scope.settings = {};
    $scope.settingsUrl = '/settings/' 
    $scope.demoActivitiesNum = 10;
    $scope.savedDemoQueries = [];
    $scope.savedQueries = [] || $scope.savedQueries;
    $scope.availableTools = [] ;
    $scope.initialTools = [
      { 'name': 'rwfind',
        'desc': 'Search Flows',
        'type': 'rpc',
        'selected': '' },
      { 'name': 'cifbulk',
        'desc': 'Search CIF',
        'type': 'rpc',
        'selected': '' },
      { 'name': 'crosscor',
        'desc': 'Correlate Data',
        'type': 'rpc',
        'selected': '' },
      { 'name': 'anon',
        'desc': 'Anonymize',
        'type': 'rpc',
        'selected': '' }
    ];


    // $scope.Socket = Socket;

    // SocketService.on('logmon:data', function(data) {
    //       $scope.logs = $scope.logs.concat(data);
    //       // $log.debug(data);
    //     });

    $scope.cifbulkQueueValues = [{
      value: 'cifbulk_v1',
      label: 'cifbulk_v1 - default'
    },{
      value: 'cifbulk_v1_test',
      label: 'cifbulk_v1 - default with debug and verbose'
    },{
      value: 'cifbulk_v1_demo',
      label: 'cifbulk_v1_demo - alternate queue'
    },{
      value: 'cifbulk_v1_demo_test',
      label: 'cifbulk_v1_demo_test - alternate queue with debug and verbose'
    }];

    $scope.anonymizeValues =[{
      value: 'true',
      label: 'Anonymization On'
    },{
      value: 'false',
      label: 'Anonymization Off'
    }];

    $scope.rpcDebugValues = [{
      value: 'true',
      label: 'RPC Client Debug On'
    },{
      value: 'false',
      label: 'RPC Client Debug Off'
    }];

    $scope.rpcVerboseValues = [{
      value: 'true',
      label: 'RPC Client Verbose On'
    },{
      value: 'false',
      label: 'RPC Client Verbose Off'
    }];

    var initializeTools = function() {
      angular.forEach($scope.initialTools, function(value, index) {
        $scope.availableTools.push(value);
      });
    };

    var initializeDemoQueries = function() {
      // Demo data
      $scope.savedDemoQueries.push({
        'name': 'Logcenter data usage',
        'desc': 'Time-series logcenter data usage',
        'key': 'logcenter-sizes-2.txt',
        'selected': ''
      });
      $scope.savedDemoQueries.push({
        'name': 'SiLK data usage',
        'key': 'silk-sizes-2.txt',
        'desc': 'Time-series SiLK data usage',
        'selected': ''
      });
      $scope.savedDemoQueries.push({
        'name': 'RWFIND Demo 1',
        'key': 'testrw1.txt',
        'desc': 'Search Seattle netflow data past 3 days for CIF 65% confidence indicators',
        'selected': ''
      });
      $scope.savedDemoQueries.push({
        'name': 'RWFIND Demo 3',
        'key': 'testrw3.txt',
        'desc': 'Search Seattle netflow data past 3 days for CIF 95% confidence indicators',
        'selected': ''
      });
      $scope.savedDemoQueries.push({
        'name': 'RWFIND Demo 5',
        'key': 'testrw5.txt',
        'desc': 'Search Seattle netflow data past 7 days for suspect CIDR block',
        'selected': ''
      });
      $scope.savedDemoQueries.push({
        'name': 'CIFBULK Demo 1',
        'key': 'testcif1.txt',
        'desc': 'Search for CIF 65% confidence IPs',
        'selected': ''
      });
     
      for (var i=2; i<$scope.demoActivitiesNum; i++) {
        $scope.savedDemoQueries.push({
          'name' : 'Demo Query '+ i,
          'key' : 'key'+i,
          'selected' : ''
        });
      }
    };

    var initializeQueryList = function() {
      angular.forEach($scope.savedDemoQueries, function(value,index) {
        $scope.savedQueries.push(value);
      });
    };

    initializeTools();
    initializeDemoQueries();
    initializeQueryList();
    
    $log.debug('Saved queries: ', $scope.savedQueries);

    $scope.queryToggle = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
      $log.debug('query panel toggle called');
    };

    $scope.setTool = function(tool, row) {
      $log.debug('setTool called: ' , tool);
      $scope.currentSelectedTool = tool;
      var filtered = $filter('filter')($scope.availableTools, {'selected': 'active'}, true);
      $log.debug('filtered ', filtered);
      angular.forEach(filtered, function(value,index) {
        value.selected = '';
      });
      $scope.availableTools[row].selected = 'active';
      
    };

    $scope.setQuery = function(query, row) {
      $log.debug('setQuery called: ',query, row);
      $scope.currentSelectedQuery = query;
      var filtered = $filter('filter')($scope.savedQueries, {'selected': 'active'}, true);
      $log.debug('filtered ', filtered);
      angular.forEach(filtered, function(value,index) {
        value.selected = '';
      });
      $scope.savedQueries[row].selected = 'active';
    };


    $scope.getTools = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      }
      $scope.showTools = true;
      $scope.showSavedQueries = false;
      $scope.showSettings = false;
    };

    $scope.getSavedQueries = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      }
      $scope.showTools = false;
      $scope.showSavedQueries = true;
      $scope.showSettings = false;
    };

    $scope.getSettings = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      }
      $scope.showTools = false;
      $scope.showSavedQueries = false;
      $scope.showSettings = true;
    };

    // Set current value of socket states
    $rootScope.logmonOn = LogService.isRunning();
    $rootScope.chatOn = ChatService.isRunning();

    $log.debug('Log and Chat are ', $scope.logmonOn, $scope.chatOn);

    $scope.toggleLogMonitor = function() {
      if ($scope.logmonOn) {
        // Turn it off
        $rootScope.logmonOn = false;
        $
        $log.debug('Turning log monitor off');
        LogService.stop();
      } else {
        // Turn it on
        $rootScope.logmonOn = true;
        $log.debug('Turning log monitor on');
        LogService.start();
      }
    };

    $scope.toggleChat = function() {
      if ($scope.chatOn) {
        // Turn it off
        $rootScope.chatOn = false;
        $log.debug('Turning chat off');
        ChatService.stop();
      } else {
        // Turn it on
        $rootScope.chatOn = true;
        $log.debug('Turning chat on');
        ChatService.start();
      }
    };

    $scope.setUserSettings = function() {
      var settings = {};
      // settings.anonymize = $scope.settings.anonymize === 'false' ? 'true' : 'false';
      settings.anonymize = $scope.settingsFormData.anonymize;
      settings.cifbulkQueue = $scope.settingsFormData.cifbulkQueue;
      settings.rpcDebug = $scope.settingsFormData.rpcDebug;
      settings.rpcVerbose = $scope.settingsFormData.rpcVerbose;

      SettingsService.update(settings).then(function(resource) {
        $log.debug('success setting, data is ', resource.data);
      }), (function(err) {
        $log.debug('setUserSettings error', err);
      });
    };
    
  }]);