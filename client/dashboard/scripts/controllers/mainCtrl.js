'use strict';
angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', 'TicketService', 'LogService','ChatService','$cookies','$location', '$routeParams', '$log', '$filter', '$http', 'SettingsService','$rootScope',
      function ($scope, TicketService, LogService, ChatService, $cookies, $location, $routeParams, $log, $filter, $http, SettingsService, $rootScope) {

    $scope.title = 'DIMS Main';

    $scope.settings = SettingsService.get();
    $scope.settingsFormData = SettingsService.get();

    $scope.isCollapsed = true;
    // Tools panel
    $scope.showTools = false;
    $scope.toolsBtnClass = 'query-btn-inactive';
    // Saved Queries panel
    $scope.showSavedQueries = false;
    $scope.savedBtnClass = 'query-btn-inactive';
    // Tickets panel
    $scope.tickets = null; // initialize
    $scope.showTickets = false;
    $scope.ticketBtnClass = 'query-btn-inactive';
    $scope.showTopicList = false;
    $scope.showTopic = false;

    $scope.showSettings = false;
    $scope.settingsBtnClass = 'query-btn-inactive';

    $scope.buttonTooltips = {
      tools: 'Show query tools',
      saved: 'Show my saved queries',
      tickets: 'Show tickets',
      settings: 'Show settings'
    }

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
     
      // for (var i=2; i<$scope.demoActivitiesNum; i++) {
      //   $scope.savedDemoQueries.push({
      //     'name' : 'Demo Query '+ i,
      //     'key' : 'key'+i,
      //     'selected' : ''
      //   });
      // }
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

    // Toggles the panel open and closed
    $scope.queryToggle = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
      $log.debug('query panel toggle called');
    };

    // Tools button was clicked
    $scope.getTools = function() {
      // Toggle if collapsed or if Tools are already selected
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      } else if ($scope.showTools) {
        $scope.queryToggle();
      }
      $scope.showTools = true;
      $scope.toolBtnClass = 'query-btn-active';
      $scope.showSavedQueries = false;
      $scope.savedBtnClass = 'query-btn-inactive';
      $scope.showSettings = false;
      $scope.settingsBtnClass = 'query-btn-inactive';
      $scope.showTickets = false;
      $scope.showTopicList = false;
      $scope.showTopic = false;
      $scope.ticketBtnClass = 'query-btn-inactive';

    };

    $scope.getSavedQueries = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      } else if ($scope.showSavedQueries) {
        $scope.queryToggle();
      }
      $scope.showTools = false;
      $scope.toolBtnClass = 'query-btn-inactive';
      $scope.showSavedQueries = true;
      $scope.savedBtnClass = 'query-btn-active';
      $scope.showSettings = false;
      $scope.settingsBtnClass = 'query-btn-inactive';
      $scope.showTickets = false;
      $scope.showTopicList = false;
      $scope.showTopic = false;
      $scope.ticketBtnClass = 'query-btn-inactive';
    };

    $scope.getSettings = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      } else if ($scope.showSettings) {
        $scope.queryToggle();
      }
      $scope.showTools = false;
      $scope.toolBtnClass = 'query-btn-inactive';
      $scope.showSavedQueries = false;
      $scope.savedBtnClass = 'query-btn-inactive';
      $scope.showSettings = true;
      $scope.settingsBtnClass = 'query-btn-active';
      $scope.showTickets = false;
      $scope.showTopicList = false;
      $scope.showTopic = false;
      $scope.ticketBtnClass = 'query-btn-inactive';
    };

    $scope.getTickets = function() {
      if ($scope.isCollapsed) {
        $scope.queryToggle();
      } else if ($scope.showTickets) {
        $scope.queryToggle();
      }
      $scope.showTools = false;
      $scope.toolBtnClass = 'query-btn-inactive';
      $scope.showSavedQueries = false;
      $scope.savedBtnClass = 'query-btn-inactive';
      $scope.showSettings = false;
      $scope.settingsBtnClass = 'query-btn-inactive';
      $scope.showTickets = true;
      $scope.ticketBtnClass = 'query-btn-active';
      if ($scope.tickets === null) {
        TicketService.getTickets().then(function(reply) {
          $scope.tickets = reply;
          $log.debug('mainCtrl. tickets are ', $scope.tickets);
        });
      }
      
      
    };

    // Set the tool selected in the Tools panel
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

    // Set the saved query selected in the saved queries panel
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

    // Set the ticket selected in the tickets panel
    $scope.setTicket = function(ticket, row) {
      $log.debug('setTickets called: ',ticket, row);
      $scope.currentSelectedTicket = ticket;
      var filtered = $filter('filter')($scope.tickets, {'selected': 'active'}, true);
      $log.debug('filtered ', filtered);
      angular.forEach(filtered, function(value,index) {
        value.selected = '';
      });
      $scope.tickets[row].selected = 'active';
      TicketService.getTicket($scope.tickets[row].key).then(function(reply) {
        // Returns object with ticket metadata, key, array of topics
        $scope.currentSelectedTicket.ticket = reply.ticket;
        $scope.currentSelectedTicket.topics = reply.topics;
        $log.debug('currentSelectedTicket is ', $scope.currentSelectedTicket);
        $scope.showTopicList = true;
        // $scope.ticketDescription = reply.description;
        // $scope.ticketShortDesc = reply.shortDesc;
        // $scope.ticketContent = reply.data;
      });
    };

    $scope.getTopic = function(topicKey, row) {

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