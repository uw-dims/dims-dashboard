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
        vm.progressText = (vm.showProgress) ? 'Hide graph' : 'Show graph';
      };

      var getGraphOptions = function getGraphOptions() {
        var options = {
          xLabel: 'Time',
          yLabelKnown: 'Total Mitigated out of known',
          yLabelAll: 'Total Mitigated out of all',
          keyKnown: 'Mitigated Known',
          keyAll: 'Mitigated All',
          graphTitle: 'IP Remediation Progress'
        };
        return options;
      };

      var getTrendX = function getTrendX(trendline, y) {
        return Math.floor((y - trendline.intercept) / trendline.slope);
      };

      var init = function init() {
        vm.data.metadata.userRemaining = vm.data.ips.data.length;
        vm.data.metadata.knownNum = vm.data.metadata.initialNum - vm.data.metadata.unknownNum;
        vm.showUserIps = (vm.data.metadata.userRemaining !== 0);
        vm.userMessage = vm.showUserIps ?  'You have ' + vm.data.metadata.userRemaining + ' IPs left to mitigate. ' :
        'You have no IPs to mitigate. ';
        vm.graphOptions = getGraphOptions();
        vm.anticipatedFinish = getTrendX(vm.data.trendline, vm.data.metadata.knownNum);
        vm.displayAnticipated = moment(vm.anticipatedFinish).format('M/D/YYYY');
        vm.statusMessage = vm.data.metadata.mitigatedNum < vm.data.metadata.knownNum ?
          'Current trend anticipates remediation of all known IPs will finish on ' + vm.displayAnticipated + '. ' : '';
        vm.data.trendPoints = [{
          x: vm.data.data[0].x,
          y: 0
        }, {
          x: vm.anticipatedFinish,
          y: vm.data.metadata.knownNum
        }];
      };

      init();

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
            $log.debug('mitigation directive getMitigation reply', reply);
            vm.data = angular.copy(reply);
            init();
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
