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

      var getTrendX = function getTrendX(trendline, y) {
        return Math.floor((y - trendline.intercept) / trendline.slope);
      };

      var getTrendY = function getTrendY(trendline, x) {
        return Math.floor(x * trendline.slope + trendline.intercept);
      };

      // This plots one set of data on two different axis, plus a trendline
      function init() {
        vm.graphOptions = angular.copy($scope.options);
        vm.input = angular.copy($scope.data);
        // vm.dataKnown = angular.copy($scope.data.data);
        // vm.dataAll = angular.copy($scope.data.data);
        vm.initialNum = vm.input.metadata.initialNum;
        vm.unknownNum = vm.input.metadata.unknownNum;
        vm.trendline = vm.input.trendline;
        $log.debug('graphOptions', vm.graphOptions);

        vm.trendPoints = [{
          x: vm.input.data[0].x,
          y: 0
        }, {
          x: getTrendX(vm.trendline, vm.initialNum - vm.unknownNum),
          y: vm.initialNum - vm.unknownNum
        }];
        // Need two arrays of data - will plot twice on two axes
        vm.graphData = [];

        vm.graphData.push({
          values: vm.input.data,
          key: vm.graphOptions.keyAll,
          yAxis: 2,
          type: 'line'
        });
        vm.graphData.push({
          values: vm.trendPoints,
          key: 'Trend for ' + vm.graphOptions.keyAll,
          yAxis: 2,
          type: 'line'
        });
        vm.graphData.push({
          values: vm.input.data,
          key: vm.graphOptions.keyKnown,
          yAxis: 1,
          type: 'line'
        });
        // Trendline
        vm.graphData.push({
          values: vm.trendPoints,
          key: 'Trend for ' + vm.graphOptions.keyKnown,
          yAxis: 1,
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

      vm.xTooltipFunction = function () {
        return function (d) {
          return d3.time.format('%b %-d, %Y %I:%M%p')(new Date(d));
        };
      };

      $log.debug('graphData', vm.graphData);

      nv.addGraph(function () {
        var chart = nv.models.multiChart()
          .options({
            withFocus: false,
            interpolate: 'linear'
          })
          .margin({top: 30, right: 80, bottom: 60, left: 80})
          .color(d3.scale.category10().range());

        // chart.yDomain1([0, vm.graphOptions.initialNum]);
        // chart.yDomain2([0, vm.graphOptions.initialNum - vm.graphOptions.unknownNum]);

        // Start with 0
        chart.yDomain2([vm.initialNum, 0]);
        chart.yDomain1([vm.initialNum - vm.unknownNum, 0]);


        chart.xAxis
          .tickFormat(vm.xAxisTickFormatFunction())
          .tickPadding(16)
          .axisLabel(vm.graphOptions.xLabel)
          .showMaxMin(false);
        // Need to explicitly set here - may be a bug in nvd3 for multichart as is should use the format
        // function for the x axis by default.
        chart.tooltip.headerFormatter(vm.xTooltipFunction());

        chart.yAxis1
          .tickFormat(vm.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel(vm.graphOptions.yLabelKnown);

        chart.yAxis2
          .tickFormat(vm.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel(vm.graphOptions.yLabelAll);

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
