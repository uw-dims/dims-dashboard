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
