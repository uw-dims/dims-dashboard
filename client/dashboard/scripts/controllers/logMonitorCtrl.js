// File: client/dashboard/scripts/controllers/LogMonitorCtrl.js

(function () {
  'use strict';

  function LogMonitorCtrl($scope, $log, $routeParams, $location, $rootScope) {
    var vm = this;
    $log.debug('LogMonitorCtrl. param is ', $routeParams.type);
    $log.debug('LogMonitorCtrl. routeParams is ', $routeParams);

    $scope.tabs = [
    {
      active: true
    }, {
      active: false
    }, {
      active: false
    }];

    $scope.active = {
      logs: false,
      devops: true,
      test: false
    };

    $scope.types = {
      logs: 'logs',
      devops: 'devops',
      test: 'test'
    };

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
