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
        data: '=',
        num: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;

      $scope.$watch('data', init);
      // This plots one set of data on two different axis, plus a trendline
      function init() {
        $log.debug('mitigationseries.directive init triggered');
        vm.graphOptions = angular.copy($scope.options);
        vm.input = angular.copy($scope.data);
        vm.chartID = 'chart' + angular.copy($scope.num);
        $log.debug('chartID is ', vm.chartID);
        vm.initialNum = vm.input.metadata.initialNum;
        vm.knownNum = vm.input.metadata.knownNum;
        vm.trendPointsKnown = vm.input.trendPointsKnown;
        vm.trendPointsAll = vm.input.trendPointsAll;
        $log.debug('graphOptions', vm.graphOptions);

        vm.graphData = [];

        vm.graphData.push({
          values: vm.input.data.known,
          key: vm.graphOptions.keyKnown,
          yAxis: 2,
          type: 'line'
        });
        vm.graphData.push({
          values: vm.trendPointsKnown,
          key: 'Trend for ' + vm.graphOptions.keyKnown,
          yAxis: 2,
          type: 'line'
        });
        vm.graphData.push({
          values: vm.input.data.all,
          key: vm.graphOptions.keyAll,
          yAxis: 1,
          type: 'line'
        });
        // vm.graphData.push({
        //   values: vm.trendPointsAll,
        //   key: 'Trend for ' + vm.graphOptions.keyAll,
        //   yAxis: 1,
        //   type: 'line'
        // });

        vm.update();

        console.log('end of init. graphData: ', vm.graphData);
      }

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

      var chart,
          chartData;

      vm.update = function update() {
        if (chartData !== undefined) {
          $log.debug('in vm.update chartData is ', chartData);
          chartData.datum(vm.graphData).call(chart);
          nv.utils.windowResize(chart.update);
        }
      };

      nv.addGraph(function () {
        chart = nv.models.multiChart()
          .options({
            withFocus: false,
            interpolate: 'linear'
          })
          .margin({top: 30, right: 80, bottom: 60, left: 80})
          .color(d3.scale.category10().range());

        // chart.yDomain1([0, vm.graphOptions.initialNum]);
        // chart.yDomain2([0, vm.graphOptions.initialNum - vm.graphOptions.unknownNum]);

        chart.yDomain1([0, vm.initialNum]);
        chart.yDomain2([0, vm.knownNum]);

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
          .axisLabel(vm.graphOptions.yLabelAll);

        chart.yAxis2
          .tickFormat(vm.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel(vm.graphOptions.yLabelKnown);

        d3.select('#chart svg')
          .append('text')
          .attr('x', 100)
          .attr('y', 40)
          .attr('text-anchor', 'middle')
          .text(vm.graphOptions.graphTitle);

        chartData = d3.select('#' + vm.chartID + ' svg')
          .datum(vm.graphData);
        chartData
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
