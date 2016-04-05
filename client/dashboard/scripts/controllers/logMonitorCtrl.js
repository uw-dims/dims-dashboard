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

  function LogMonitorCtrl($scope, $log, $routeParams, $location, $rootScope) {
    var vm = this;
    $log.debug('LogMonitorCtrl. param is ', $routeParams.type);
    $log.debug('LogMonitorCtrl. routeParams is ', $routeParams);

    $scope.logMaximized = true;
    $scope.logClass = 'logMax';

    //TODO - generate this programatically
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

    var activateTab = function activateTab(type) {
      if (type !== undefined && $scope.active.hasOwnProperty(type)) {
        $log.debug('type is ', type);
        $scope.active[type] = true;
      }
    };

    activateTab($routeParams.type);

  }

  // Plug controller function into AngularJS
  angular
    .module('dimsDashboard.controllers')
    .controller('LogMonitorCtrl', LogMonitorCtrl);

  LogMonitorCtrl.$inject = ['$scope', '$log', '$routeParams', '$location', '$rootScope'];

}());

// EOF
