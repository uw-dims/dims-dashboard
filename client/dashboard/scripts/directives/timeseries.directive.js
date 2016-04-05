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
(function () {
  'use strict';

  function timeseries($log) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/timeseries.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
        options: '=',
        data: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;

      function init() {
        $log.debug('options', $scope.options);
        $log.debug('data', $scope.data);
        $scope.graphOptions = angular.copy($scope.options);
        $log.debug('graphOptions', $scope.graphOptions);
        $scope.graphData = [{
          values: angular.copy($scope.data),
          key: $scope.graphOptions.key
        }];
      }

      init();
      //options:
      // xLabel
      // yLabel
      // withFocus
      // key

      $scope.xAxisTickFormatFunction = function () {
        return function (d) {
          return d3.time.format('%x')(new Date(d));
        };
      };

      $scope.yAxisTickFormatFunction = function () {
        return function (d) {
          return d3.format(',f')(d);
        };
      };

      $log.debug('graphData', $scope.graphData);

      nv.addGraph(function () {
        var chart = nv.models.lineChart()
          .margin({top: 30, right: 30, bottom: 60, left: 80})
          .color(d3.scale.category10().range());

        // if ($scope.graphOptions.hasOwnProperty('yMax')) {
        //   $log.debug('Modifying yRange');
        //   chart.forceY([$scope.graphOptions.yMin,
        //     d3.max($scope.graphData, function (d) {
        //       return d.v > 400 ? d.v : 400;
        //     })]);
        // }
        chart.xAxis
          .tickFormat($scope.xAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel($scope.graphOptions.xLabel);

        chart.yAxis
          .tickFormat($scope.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel($scope.graphOptions.yLabel);

        d3.select('#chart svg')
          .datum($scope.graphData)
          .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
      });
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('timeseries', timeseries);

  timeseries.$inject = ['$log'];

}());
