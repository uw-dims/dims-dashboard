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
'use strict';
angular.module('dimsDashboard.controllers').
  controller('GraphCtrl', ['$scope', '$log', '$http','FileService', 'DataService', '$location', '$routeParams', 'SettingsService',
      function($scope, $log, $http, FileService, DataService, $location, $routeParams, SettingsService) {

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

          $log.debug('graphDataPoints', $scope.graphDataPoints);

          $scope.showResults = true;

          nv.addGraph(function() {
            chart = nv.models.lineWithFocusChart()
                // .useInteractiveGuideline(true)
                .margin({top: 30, right: 30, bottom: 60, left: 80})
                .color(d3.scale.category10().range());

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
        return d3.format(',.1f')(d/1000000);
      };

    };


  }]);
