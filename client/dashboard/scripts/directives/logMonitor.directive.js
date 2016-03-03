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

  function logMonitor(LogService, $log) {
    var directive = {
      restrict: 'AEC',
      templateUrl: 'views/partials/logmonitor.html',
      controller: controllerFunc,
      controllerAs: 'vm',
      link: linkFunc,
      scope: {
        exchange: '='
      }
    };

    return directive;

    function linkFunc(scope, el, attr, ctrl) {
      // Don't need this yet
      // $log.debug('In linkFunc, exchange is ', scope.exchange);
    }

    function controllerFunc($scope) {
      //vm.messages = '';
      // $log.debug('LogMonitor Directive: In controllerFunc, exchange is ', $scope.exchange);
      var vm = this;

      vm.buttonText = 'Turn on';
      vm.linesMax = 10000;

      var formatter = function formatter(message) {
        return message + '\n';
      };

      vm.clear = function () {
        vm.messages = formatter('[*] Waiting for messages...');
      };

      function init() {
        vm.exchange = angular.copy($scope.exchange);
        vm.type = vm.exchange.name;
        vm.displayName = vm.exchange.display;
        vm.clear();
        vm.logClass = 'logMax';
        vm.logMaximized = true;
        vm.lines = 0;
      }

      init();

      vm.toggle = function toggle(type) {
        if (LogService.isRunning(type)) {
          vm.buttonText = 'Turn on';
          LogService.stop(type);
        } else {
          vm.buttonText = 'Turn off';
          LogService.start(type);
        }
      };

      vm.logmonOn = function () {
        return LogService.isRunning(vm.type);
      };

      vm.offListen = function () {};
      vm.start = function () {
        LogService.setRunning(vm.type, true);
        vm.clear();
        $scope.offListen = $scope.$on('socket:' + constants.fanoutExchanges[vm.type].event, function (event, data) {
          $log.debug('LogMonitor Directive: got a message ', event.name, data);
          if (!data) {
            $log.error('LogMonitor Directive: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
            return;
          }
          $scope.$apply(function () {
            vm.lines++;
            if (vm.lines < vm.linesMax ) {
              vm.messages = vm.messages + formatter(data);
            } else {
              vm.messages = formatter('[*] Buffer max reached - clearing log');
              vm.messages = formatter(data);
            }
          });
        });
      };

      vm.listener = function (event) {
        if (event === 'start') {
          vm.start();
        } else if (event === 'stop') {
          vm.stop();
        }
      };

      vm.stop = function () {
        $log.debug('LogMonitor Directive: stop')
        $scope.offListen();
        LogService.setRunning(vm.type, false);
      };

      LogService.registerObserverCallback(vm.type, vm.listener);

    }

  }

  angular
    .module('dimsDashboard.directives')
    .directive('logMonitor', logMonitor);

  logMonitor.$inject = ['LogService', '$log', '$rootScope'];

}());
