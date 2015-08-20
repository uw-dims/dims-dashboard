'use strict';
angular.module('dimsDashboard.controllers').
  controller('MainCtrl', ['$scope', 'DataService', 'TicketService', 'LogService', 'ChatService',  '$cookies', '$location', '$routeParams', '$log', '$filter', '$http', 'SettingsService', '$rootScope',
      function ($scope, DataService, TicketService, LogService, ChatService, $cookies, $location, $routeParams, $log, $filter, $http, SettingsService, $rootScope) {

    $scope.title = 'Data View';

    $scope.mapTestData = {};
    $scope.fileTestData = {};
    $scope.mapTestData.name;
    $scope.fileTestData.name;

    // $scope.settings = SettingsService.get();
    // $scope.settingsFormData = SettingsService.get();

    $scope.isCollapsed = false;
    // Tools panel
    $scope.showTools = true;
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

    $scope.showCif = false;
    $scope.displayData = {};

    // $scope.showSettings = false;
    // $scope.settingsBtnClass = 'query-btn-inactive';

    $scope.buttonTooltips = {
      tools: 'Show query tools',
      saved: 'Show my saved queries',
      tickets: 'Show tickets'
    }

    // $scope.logmonOn = false;
    // $scope.logs = [];
    $scope.currentSelectedQuery = {};
    $scope.currentSelectedTool = {};
    // $scope.settings = {};
    // $scope.settingsUrl = '/settings/'
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
      // $scope.showSettings = false;
      // $scope.settingsBtnClass = 'query-btn-inactive';
      $scope.showTickets = false;
      $scope.showTopicList = false;
      $scope.showTopic = false;
      $scope.ticketBtnClass = 'query-btn-inactive';
      $scope.showResults=false;
      $scope.showCif = false;

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
      // $scope.showSettings = false;
      // $scope.settingsBtnClass = 'query-btn-inactive';
      $scope.showTickets = false;
      $scope.showTopicList = false;
      $scope.showTopic = false;
      $scope.ticketBtnClass = 'query-btn-inactive';
      $scope.showResults=false;
      $scope.showCif = false;
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
      // $scope.showSettings = false;
      // $scope.settingsBtnClass = 'query-btn-inactive';
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
      $log.debug('setTool called. currentSelectedTool.name is ' , tool.name);
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
      $log.debug('setTickets scalled: ',ticket, row);
      $scope.currentSelectedTicket = ticket;
      $scope.currentSelectedTopic = null;
      $scope.showTopic = false;
      $scope.showResults = false;
      $scope.rawResults = '';
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

    $scope.setTopic = function(topic, row) {
      $log.debug('setTopic called. topic is ', topic, 'row is ', row);
      $scope.currentSelectedTopic = topic;
      var filtered = $filter('filter')($scope.currentSelectedTicket.topics, {'selected': 'active'}, true);
      angular.forEach(filtered, function(value,index) {
        value.selected = '';
      });
      $scope.rawData = '';
      $scope.showGraph = false;
      $scope.currentSelectedTicket.topics[row].selected = 'active';
      TicketService.getTopic(topic.topicKey).then(function(reply) {
        $log.debug('reply is ', reply);
        $scope.rawData = reply.content.data;
        $scope.currentSelectedTopic.description = reply.content.description;
        $scope.currentSelectedTopic.shortDesc = reply.content.shortDesc;
        $scope.currentSelectedTopic.data = reply.content.data;
        $scope.currentSelectedTopic.displayType = reply.content.displayType;
        $log.debug('currentSelectedTopic is ', $scope.currentSelectedTopic);
        $scope.showTopic = true;
        $scope.showResults=true;
        $scope.isRaw = true;
        $scope.currentSelectedTopic.responseType = reply.content.responseType;
        // Check to see if we can display data
        // var checkTopic = $scope.currentSelectedTopic.name.split(':');
        if ($scope.currentSelectedTopic.displayType === 'cif') {
          $scope.showCif = true;
          if ($scope.currentSelectedTopic.responseType === 'json') {
            $scope.displayData = {};
            $scope.noResults = [];
            $scope.displayData.iff = $scope.currentSelectedTopic.data.iff;
            $scope.displayData.program = $scope.currentSelectedTopic.data.program;
            $scope.displayData.time = $scope.currentSelectedTopic.data.time;
            $scope.displayData.results=[];
            for (var i=0; i < $scope.currentSelectedTopic.data.results.length; i++) {
              if ($scope.currentSelectedTopic.data.results[i].results.length === 0) {
                $scope.noResults.push({searchitem: $scope.currentSelectedTopic.data.results[i].searchitem});
              } else {
                for (var j=0; j < $scope.currentSelectedTopic.data.results[i].results.length; j++) {
                  // var detectDate = new Date($scope.currentSelectedTopic.data.results[i].results[j].detecttime*1000);
                  // var createdDate = new Date($scope.currentSelectedTopic.data.results[i].results[j].created*1000);
                  // $scope.currentSelectedTopic.data.results[i].results[j].detecttime = detectDate;
                  // $scope.currentSelectedTopic.data.results[i].results[j].created = createdDate;
                }
                $scope.displayData.results.push($scope.currentSelectedTopic.data.results[i]);
              }
            }
            $log.debug('cif display data is ', $scope.displayData);
          }
        } else {
          $scope.showCif = false;
        }

        if ($scope.currentSelectedTopic.displayType === 'double-time-series' &&
                $scope.currentSelectedTopic.responseType !== 'json') {
          $scope.currentSelectedTopic.data = DataService.parseTimeSeries($scope.rawData);
          $scope.showResults = true;
          $scope.showGraph = false;
          $scope.graphData($scope.currentSelectedTopic.data);
        }

      });

    };

    $scope.graphData = function(result) {
      $scope.showResults = true;
      $scope.showGraph = true;
      $scope.resultsMsg = 'Results;';
      var chart = null;
      // Empty any existing chart
      $('#chart svg').empty();


          $scope.graphDataPoints = [
            {
              'key': 'MB',
              'values': result
            }
          // Massage data
          ].map(function(series) {
            series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
            return series;
          });

          $scope.showResults = true;

          nv.addGraph(function() {
            console.log('in nv.addGraph');
            chart = nv.models.lineWithFocusChart()
                // .useInteractiveGuideline(true)
                .margin({top: 30, right: 30, bottom: 60, left: 100})
                // .margin2({top: 0, right: 30, bottom: 60, left: 60})
                // x: function(d,i) { return i},
                // showXAxis: true,
                // showYAxis: true,
                .transitionDuration(250)
                // .interpolate("basis")
                .color(d3.scale.category10().range());

            // $scope.chart.dispatch.on('renderEnd', function(){
            //       console.log('rendered');
            //   });

            // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
            chart.xAxis
              .tickFormat($scope.xAxisTickFormatFunction())
              .tickPadding('8')
              .axisLabel('Date');

            chart.x2Axis
              .tickFormat($scope.xAxisTickFormatFunction())
              .tickPadding(8)
              .axisLabel('Click and drag to select date range');

            chart.yAxis
              .tickFormat($scope.yAxisTickFormatFunction())
              .tickPadding(4)
              .axisLabel('Storage in MBytes')
              .axisLabelDistance(0);

            chart.y2Axis
              .tickFormat($scope.yAxisTickFormatFunction())
              .tickPadding('4');

            d3.select('#chart svg')
              .datum($scope.graphDataPoints)
              .call(chart);

            //TODO: Figure out a good way to do this automatically
            nv.utils.windowResize(chart.update);
            //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

            // chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

            return chart;
          });
    };

    $scope.xAxisTickFormatFunction = function() {
      return function(d) {
        return d3.time.format('%x')(new Date(d));
      };

    };

    $scope.yAxisTickFormatFunction = function() {
      return function(d) {
        return d3.format(',.3f')(d/1000000);
      };

    };

    $scope.callClient = function(tool, formData){
      $log.debug('controllers/mainCtrl.callClient. tool is ', tool, 'formData is ', formData);

    };

  }]);
