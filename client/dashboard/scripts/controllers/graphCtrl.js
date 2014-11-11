'use strict';
angular.module('dimsDashboard.controllers').
  controller('GraphCtrl', ['$scope','$http','FileService', 'DataService', '$location', '$routeParams', 'SettingsService',
      function($scope, $http, FileService, DataService, $location, $routeParams, SettingsService) {

    console.log('In GraphCtrl');
    $scope.settings = SettingsService.get();
    $scope.formData = {};
    $scope.fileNames = [];
    $scope.showFiles = false;
    $scope.showResults = true;
    var chart = null;
  
    FileService.getDemoList('timeseries').then(function(result) {
      $scope.fileNames = result.fileNames;
      $scope.filePath = result.filePath;
      $scope.showFiles = true;
    });

    $scope.graphData = function() {
      $scope.showResults = true;
      $scope.formErrorMsg = '';
      $scope.resultsMsg = 'Results - Waiting...';
      // Empty any existing chart
      $('#chart svg').empty();

      DataService.getData($scope.filePath+$scope.formData.fileName).
        then (function(result) {
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


  }]);