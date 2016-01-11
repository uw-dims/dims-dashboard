(function () {
  'use strict';

  function mitigation(MitigationService, $log, $modal) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/mitigation.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
        data: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
    }

    function controllerFunc($scope) {
      var vm = this;
      vm.data = angular.copy($scope.data);
      vm.showProgress = false;
      vm.progressText = 'Show graph';

      vm.toggleProgress = function toggleProgress() {
        vm.showProgress = (vm.showProgress) ? false : true;
        vm.progressText = (vm.showProgress) ? 'Hide progress' : 'Show progress';
      };

      $log.debug('mitigation.directive input data ', vm.data);

      var getGraphOptions = function getGraphOptions(metadata, trendline) {
        var options = {
          xLabel: 'Time',
          yLabelKnown: 'Total Mitigated out of known',
          yLabelAll: 'Total Mitigated out of all',
          keyKnown: 'Mitigated Known',
          keyAll: 'Mitigated All',
          initialNum: metadata.initialNum,
          unknownNum: metadata.unknownNum,
          mitigatedNum: metadata.mitigatedNum,
          trendline: trendline
        };
        $log.debug('vm.getGraphOptions', options);
        return options;
      };

      // Add options for graphing
      var addOptions = function addOptions(data) {
        var result = [];
        _.forEach(data, function (value, index) {
          value.graphOptions = getGraphOptions(value.metadata, value.trendline);
          result.push(value);
        });
        return data;
      };

      // Settings link handler - creates the modal window
      vm.showIps = function showIps(data, key) {
        $scope.modalInstance = $modal.open({
          templateUrl: '../views/partials/myIps.html',
          controller: ModalInstanceCtrl,
          size: 'lg',
          resolve: {
            data: function () {
              return data;
            },
            key: function () {
              return key;
            }
          }
        });
        // Get the updated data after submitting
        $scope.modalInstance.result
        .then(function (reply) {
          $log.debug('reply from modal', reply);
          MitigationService.getMitigation(vm.data.key)
          .then(function (reply) {
            $log.debug('getMitigation reply', reply);
          });
        }, function () {
          $log.debug('modal dismissed at: ', new Date());
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, data, key) {
        $scope.title = 'IPs to Mitigate';
        $scope.cols = 4;
        $scope.data = data;
        $scope.key = key;
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
        $scope.ok = function (msg) {
          $modalInstance.close(msg);
        };
        var format = function format(array, numCols) {
          var numRows = _.ceil(array.length / numCols);
          var rows = [];
          for (var k = 0; k < numRows; k++) {
            rows[k] = [];
          }
          $log.debug('empty rows ', rows);
          var i = 0;
          _.forEach(array, function (value) {
            i = (i > numRows - 1) ? 0 : i;
            rows[i].push(value);
            i++;
          });
          return rows;
        };

        $scope.ipRows = format(data, $scope.cols);
        $scope.ipResults = [];

        $scope.remediate = function (results) {
          $scope.ipResults = angular.copy(results);
          $log.debug('remediated ips', $scope.ipResults);
          MitigationService.remediate($scope.key, $scope.ipResults)
          .then(function (reply) {
            $scope.ok({
              success: true,
              data: $scope.ipResults
            });
          })
          .catch(function (err) {
            $log.debug('modal reply error', err);
            $scope.ok({
              success: false,
              data: 'An error occurred when submitting your IPs'
            });
          });
        };
      };
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigation', mitigation);

  mitigation.$inject = ['MitigationService', '$log', '$modal'];

}());
