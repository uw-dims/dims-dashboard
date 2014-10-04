'use strict';
angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', 'Socket', '$location', '$routeParams', '$log', '$filter', '$http', function ($scope, Socket, $location, $routeParams, $log, $filter, $http) {
    // write Ctrl here
    $log.debug('In MainCtrl');

    $scope.isCollapsed = true;
    $scope.showTools = false;
    $scope.showSavedQueries = false;
    $scope.showActivities = false;
    $scope.logmonOn = false;
    $scope.logs = [];
    $scope.currentSelectedQuery = {};
    $scope.currentSelectedTool = {};
    $scope.settings = {};
    $scope.settingsUrl = '/settings/0';
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

    $scope.Socket = Socket;

    // SocketService.on('logmon:data', function(data) {
    //       $scope.logs = $scope.logs.concat(data);
    //       // $log.debug(data);
    //     });

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

    $scope.toggleLogMonitor = function() {

      if ($scope.logmonOn) {
        // Turn it off
        $scope.logmonOn = false;
        $log.debug('Turning log monitor off');
        // SocketService.emit('logmon:stop');
        // SocketService.remove('logomon:data');
        $scope.Socket.socket.emit('logmon:stop');
      } else {
        // Turn it on
        $scope.logmonOn = true;
        $log.debug('Turning log monitor on');
        // SocketService.emit('logmon:start', true);
        $scope.Socket.socket.emit('logmon:start', true);
      }

    };

    $scope.getUserSettings = function() {
      $log.debug('in getUserSettings');
      return $http({
        method: 'GET',
        url: $scope.settingsUrl
      }).
        success(function(data, status, headers, config) {
          $log.debug('data is ', data);
          $scope.settings = data;
          $log.debug('scope settings now', $scope.settings);

        }).
        error(function(data, status, headers, config) {
          console.log('Error getting settings');
          console.log(data);
          console.log(status);
        });
    };

    $scope.setUserSettings = function() {
      var settings = $scope.settings;
      settings.anonymize = $scope.settings.anonymize === 'false' ? 'true' : 'false';

      return $http({
        method: 'PUT',
        url: $scope.settingsUrl,
        params: settings
      }).
        success(function(data, status, headers, config) {
          $log.debug('success setting, data is ', data);
          $log.debug('status is ', status);
        }).
        error(function(data, status, headers, config) {
          console.log('Error setting settings');
          console.log(data);
          console.log(status);
        });
      };

      // Initialize settings
      $scope.getUserSettings();


  }]);