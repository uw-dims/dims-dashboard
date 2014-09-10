'use strict';
angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', '$location', '$routeParams', '$log', '$filter', function ($scope, $location, $routeParams, $log, $filter) {
    // write Ctrl here
    $log.debug('In MainCtrl');

    $scope.isCollapsed = true;
    $scope.showTools = false;
    $scope.showSavedQueries = false;
    $scope.showActivities = false;
    $scope.currentSelectedQuery = {};
    $scope.currentSelectedTool = {};
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

    var initializeTools = function() {
      angular.forEach($scope.initialTools, function(value, index) {
        $scope.availableTools.push(value);
      });
    };

    var initializeDemoQueries = function() {
      // Demo data
      for (var i=0; i<$scope.demoActivitiesNum; i++) {
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
      $scope.showTools = true;
      $scope.showSavedQueries = false;
      $log.debug('getTools called');
    };

    $scope.getSavedQueries = function() {
      $scope.showTools = false;
      $scope.showSavedQueries = true;
      $log.debug('getSavedQueries called');
    };
  }]);