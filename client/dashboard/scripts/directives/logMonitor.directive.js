// file: client/dashboard/scripts/directives/userProfile.directive.js

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
      vm.linesMax = 5000;

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
