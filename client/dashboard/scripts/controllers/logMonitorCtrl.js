// File: client/dashboard/scripts/controllers/LogMonitorCtrl.js

(function () {
  'use strict';

  function LogMonitorCtrl($scope, $log, $routeParams, $location, $rootScope) {
    var vm = this;
    $log.debug('LogMonitorCtrl. param is ', $routeParams.type);
    $log.debug('LogMonitorCtrl. routeParams is ', $routeParams);

    $scope.logMaximized = true;
    $scope.logClass = 'logMax';

    //TODO(lparsons) - generate this programatically
    $scope.tabs = [
    {
      active: true
    }, {
      active: false
    }, {
      active: false
    }, {
      active: false
    }, {
      active: false
    }];

    $scope.active = {
      logs: false,
      health: false,
      devops: true,
      test: false,
      dimstr: false
    };

    // $scope.types = {
    //   logs: 'logs',
    //   devops: 'devops',
    //   test: 'test',
    //   health: 'health',
    //   dimstr: 'dimstr'
    // };

     // Close the log monitor
    $scope.close = function () {
      $log.debug('controllers/LogCtrl.close');
      $rootScope.logWindowOn = false;
      //LogService.setRunning(false);
      // $scope.offListen();
    };

    // Hide the log monitor
    $scope.hide = function () {
      $log.debug('controllers/LogCtrl.hide');
      $scope.logMaximized = false;
      $scope.logClass = 'logMin';
    };

    // Show the log monitor
    $scope.show = function () {
      $log.debug('controllers/LogCtrl.show');
      $scope.logMaximized = true;
      $scope.logClass = 'logMax';
    };

    $scope.types = {
      logs: {
        name: 'logs',
        display: 'Logs'
      },
      devops: {
        name: 'devops',
        display: 'Devops'
      },
      test: {
        name: 'test',
        display: 'CI Testing'
      },
      health: {
        name: 'health',
        display: 'Health'
      },
      dimstr: {
        name: 'dimstr',
        display: 'Test Report'
      }
    };

    // $scope.typeNames = {
    //   logs: 'Logs',
    //   devops: 'Devops',
    //   test: 'CI Testing',
    //   health: 'Health',
    //   dimstr: 'Test Report'
    // };

    // var activateTab = function activateTab(num) {
    //   if (num >= 0 && num <= 2) {
    //     $scope.tabs[num].active = true;
    //   }
    // };

    var activateTab = function activateTab(type) {
      if (type !== undefined && $scope.active.hasOwnProperty(type)) {
        $log.debug('type is ', type);
        $scope.active[type] = true;
      }
    };

    activateTab($routeParams.type);

    // if ($routeParams.type === 'settings') {
    //   activateTab(2);
    // }

  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('LogMonitorCtrl', LogMonitorCtrl);

  LogMonitorCtrl.$inject = ['$scope', '$log', '$routeParams', '$location', '$rootScope'];


}());

// EOF
