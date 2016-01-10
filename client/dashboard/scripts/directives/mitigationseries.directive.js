(function () {
  'use strict';

  function mitigationseries($log) {
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

      var getTrendPoints = function getTrendPoints(trendline, xInt, yMax) {
        var points = [];
        points.push({
          x: xInt,
          y: 0
        });
        points.push({
          x: getFinalVal(yMax, trendline),
          y: yMax
        });
        return points;

      };

      var getFinalVal = function getFinalVal(y, trendline) {
        return Math.floor((y - trendline.intercept) / trendline.slope);
      };

      // This plots one set of data on two different axis, plus a trendline
      function init() {
        vm.graphOptions = angular.copy($scope.options);
        vm.data = angular.copy($scope.data);
        $log.debug('graphOptions', vm.graphOptions);
        // Need two arrays of data - will plot twice on two axes
        vm.graphData = [{
          values: vm.data,
          key: vm.graphOptions.key1,
          yAxis: 2,
          type: 'line'
        }];
        vm.graphData.push({
          values: vm.data,
          key: vm.graphOptions.key2,
          yAxis: 1,
          type: 'line'
        });
        // Trendline
        vm.graphData.push({
          values: getTrendPoints(vm.graphOptions.trendline, vm.data[0].x, vm.graphOptions.initialNum - vm.graphOptions.unknownNum),
          key: 'Trend for ' + vm.graphOptions.key1,
          yAxis: 2,
          type: 'line'
        });
        console.log('end of init. graphData: ', vm.graphData);
      }

      init();
      //options:
      // xLabel
      // yLabel
      // withFocus
      // key

      vm.xAxisTickFormatFunction = function () {
        return function (d) {
          return d3.time.format('%x')(new Date(d));
        };
      };

      vm.yAxisTickFormatFunction = function () {
        return function (d) {
          return d3.format(',f')(d);
        };
      };

      $log.debug('graphData', vm.graphData);

      nv.addGraph(function () {
        var chart = nv.models.multiChart()
          .options({
            withFocus: false
          })
          .margin({top: 30, right: 80, bottom: 60, left: 80})
          .color(d3.scale.category10().range());

        if (vm.graphOptions.hasOwnProperty('yMax1') && vm.graphOptions.hasOwnProperty('yMin1')) {
          chart.yDomain1([vm.graphOptions.yMin1, vm.graphOptions.yMax1]);
        }

        if (vm.graphOptions.hasOwnProperty('yMax2') && vm.graphOptions.hasOwnProperty('yMin2')) {
          chart.yDomain2([vm.graphOptions.yMin2, vm.graphOptions.yMax2]);
        }

        chart.xAxis
          .tickFormat(vm.xAxisTickFormatFunction())
          .tickPadding(16)
          .axisLabel(vm.graphOptions.xLabel);
        // Need to explicitly set here - may be a bug in nvd3 for multichart as is should use the format
        // function for the x axis by default.
        chart.tooltip.headerFormatter(vm.xAxisTickFormatFunction());

        chart.yAxis1
          .tickFormat(vm.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel(vm.graphOptions.yLabel1);

        chart.yAxis2
          .tickFormat(vm.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel(vm.graphOptions.yLabel2);

        d3.select('#chart svg')
          .datum(vm.graphData)
          .call(chart);

        nv.utils.windowResize(chart.update);
        return chart;
      });
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigationseries', mitigationseries);

  mitigationseries.$inject = ['$log'];

}());
