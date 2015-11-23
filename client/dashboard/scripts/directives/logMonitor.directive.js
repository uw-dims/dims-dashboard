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
      $log.debug('In linkFunc, exchange is ', scope.exchange);
    }

    function controllerFunc($scope) {
      //vm.messages = '';
      $log.debug('LogMonitor Directive: In controllerFunc, exchange is ', $scope.exchange);
      var vm = this;

      vm.buttonText = 'Turn on';

      vm.clear = function () {
        vm.messages = '';
      };

      function init() {
        vm.exchange = angular.copy($scope.exchange);
        vm.type = vm.exchange.name;
        vm.displayName = vm.exchange.display;
        vm.clear();
        vm.logClass = 'logMax';
        vm.logMaximized = true;
      }

      init();

      var formatter = function formatter(date, message) {
        return message + '\n';
      };

      vm.toggle = function toggle(type) {
        //$log.debug('vm.toggle. rootScope.logmonOn is ', $rootScope.logmonOn);
        //$rootScope.logmonOn[type] = LogService.isRunning(type);
        if (LogService.isRunning(type)) {
          // Turn it off
          //$rootScope.logmonOn[type] = false;
          $log.debug('LogMonitor Directive Turning log monitor off for ', type);
          vm.buttonText = 'Turn on';
          LogService.stop(type);
        } else {
          // Turn it on
          //$rootScope.logmonOn[type] = true;
          $log.debug('LogMonitor Directive Turning log monitor on');
          vm.buttonText = 'Turn off';
          LogService.start(type);
        }
      };

      vm.logmonOn = function () {
        return LogService.isRunning(vm.type);
      };

      vm.offListen = function () {};
      vm.start = function () {
        $log.debug('LogMonitor Directive: start')
        LogService.setRunning(vm.type, true);
        vm.clear();
        $scope.offListen = $scope.$on('socket:' + constants.fanoutExchanges[vm.type].event, function (event, data) {
          $log.debug('LogMonitor Directive: got a message ', event.name, data);
          if (!data) {
            $log.error('LogMonitor Directive: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
            return;
          }
          $scope.$apply(function () {
            vm.messages = vm.messages + formatter(new Date(), data);
          });
        });
      };

      vm.listener = function (event) {
        $log.debug('LogMonitor Directive listener. event: ', event);
        if (event === 'start') {
          $log.debug('LogMonitor Directive: listener. event is start');
          vm.start();
        } else if (event === 'stop') {
          $log.debug('LogMonitor Directive: listener. event is stop');
          vm.stop();
        }
      };

      vm.stop = function () {
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
