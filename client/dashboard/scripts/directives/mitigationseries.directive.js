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

      // This plots one set of data on two different axis
      function init() {
        $log.debug('options', $scope.options);
        $log.debug('data', $scope.data);
        $scope.graphOptions = angular.copy($scope.options);
        $log.debug('graphOptions', $scope.graphOptions);
        var dataArray = [];
        // Need two arrays of data - will plot twice on two axis
        $scope.graphData = [{
          values: angular.copy($scope.data),
          key: $scope.graphOptions.key1,
          yAxis: 1,
          type: 'bar'
        }];
        $scope.graphData.push({
          values: angular.copy($scope.data),
          key: $scope.graphOptions.key2,
          yAxis: 2,
          type: 'bar'
        });
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
        var chart = nv.models.multiChart()
          .options({
            withFocus: false
          })
          .margin({top: 30, right: 80, bottom: 60, left: 80})
          .color(d3.scale.category10().range());

        if ($scope.graphOptions.hasOwnProperty('yMax1') && $scope.graphOptions.hasOwnProperty('yMin1')) {
          chart.yDomain1([$scope.graphOptions.yMin1, $scope.graphOptions.yMax1]);
        }

        if ($scope.graphOptions.hasOwnProperty('yMax2') && $scope.graphOptions.hasOwnProperty('yMin2')) {
          chart.yDomain2([$scope.graphOptions.yMin2, $scope.graphOptions.yMax2]);
        }

        // if ($scope.graphOptions.hasOwnProperty('yMax')) {
        //   $log.debug('Modifying yRange');
        //   chart.forceY([$scope.graphOptions.yMin,
        //     d3.max($scope.graphData, function (d) {
        //       return d.v > 400 ? d.v : 400;
        //     })]);
        // }
        chart.xAxis
          .tickFormat($scope.xAxisTickFormatFunction())
          .tickPadding(16)
          .axisLabel($scope.graphOptions.xLabel);

        chart.tooltip.headerFormatter($scope.xAxisTickFormatFunction());

        chart.yAxis1
          .tickFormat($scope.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel($scope.graphOptions.yLabel1);

        chart.yAxis2
          .tickFormat($scope.yAxisTickFormatFunction())
          .tickPadding(8)
          .axisLabel($scope.graphOptions.yLabel2);

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
    .directive('mitigationseries', mitigationseries);

  mitigationseries.$inject = ['$log'];

}());
