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

  function mitigation(MitigationService, TicketService, $log, $modal, $rootScope) {
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

      vm.showDelete = function showDelete() {
        if ($rootScope.currentUser) {
          return $rootScope.currentUser.isSysadmin || false;
        } else {
          return false;
        }
      };

      vm.deleteTicket = function deleteTicket(ticketKey) {
        $log.debug('deleteTicket key is ', ticketKey);
        TicketService.deleteTicket(ticketKey)
        .then(function (reply) {
          $log.debug('Mitigation delete reply', reply);
          // notify other scopes
          $rootScope.$broadcast('mitigations-changed');
        })
        .catch(function (err) {
          $log.debug(err);
        });
      };

      var getGraphOptions = function getGraphOptions() {
        var options = {
          xLabel: 'Time',
          yLabelKnown: 'Number remaining out of known',
          yLabelAll: 'Number remaining out of all',
          keyKnown: 'Known remaining',
          keyAll: 'All remaining',
          graphTitle: 'Remediation Progress'
        };
        return options;
      };

      var getTrendX = function getTrendX(trendline, y) {
        $log.debug('getTrendX', trendline, y);
        return Math.floor((y - trendline.intercept) / trendline.slope);
      };

      var init = function init() {
        vm.data.metadata.userRemaining = vm.data.ips.data.length;
        vm.showGraph = false;
        vm.showUserIps = (vm.data.metadata.userRemaining !== 0);
        vm.userMessage = vm.showUserIps ?  'You have ' + vm.data.metadata.userRemaining + ' items left to mitigate. ' :
        'You have no IPs to mitigate. ';
        vm.graphOptions = getGraphOptions();
        $log.debug('in init. vm.data is ', vm.data);

        if (vm.data.metadata.mitigatedNum > 0) {
          vm.showGraph = true;
          vm.anticipatedFinishKnown = getTrendX(vm.data.data.trendKnown, 0);
          vm.displayAnticipated = moment(vm.anticipatedFinishKnown).format('M/D/YYYY');
          vm.statusMessage = vm.data.metadata.mitigatedNum < vm.data.metadata.knownNum ?
            'Current trend anticipates remediation of all known items will finish on ' + vm.displayAnticipated + '. ' : '';
          vm.data.trendPointsKnown = [{
            x: vm.data.data.known[0].x,
            y: vm.data.metadata.knownNum
          }, {
            x: vm.anticipatedFinishKnown,
            y: 0
          }];
          $log.debug('going to call getTrendX. trendAll is ', 0);
          vm.data.trendPointsAll = [{
            x: vm.data.data.all[0].x,
            y: vm.data.metadata.initialNum
          }, {
            x: getTrendX(vm.data.data.trendAll, 0),
            y: 0
          }];
        } else {
          vm.statusMessage = 'No IPs have been mitigated';
        }
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
          $log.debug('mitigation modal dismissed at: ', new Date());
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, data, key) {
        $scope.title = 'Items to mitigate';
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
          if ($scope.ipResults.length === 0) {
            $scope.ok({
              success: true,
              data: 'You did not select any IPs'
            });
          } else {
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
          }

        };
      };
    }
  }

  angular
    .module('dimsDashboard.directives')
    .directive('mitigation', mitigation);

  mitigation.$inject = ['MitigationService', 'TicketService', '$log', '$modal', '$rootScope'];

}());
