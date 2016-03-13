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
'use strict';

angular.module('dimsDashboard.controllers').
  controller('LogCtrl', ['$scope', '$location', '$log', '$rootScope',
    function ($scope, $location, $log, $rootScope) {

    $log.debug('logCtrl. scope.currentUser is ', $scope.currentUser);

    // Initialize
    $scope.logMaximized = true;
    $scope.logClass = 'logMax';
    // $scope.messages = '';

    // $scope.offListen = function () {};

    // Listener for start and stop events. Will register as an Observer callback
    // for LogService
    // $scope.listener = function (event) {
    //   if (event === 'start') {
    //     $scope.start();
    //   } else if (event === 'stop') {
    //     $scope.stop();
    //   }
    // };

    // Register as a listener for LogService
    //LogService.registerObserverCallback($scope.listener);

    // Close the log monitor
    $scope.close = function () {
      $log.debug('controllers/LogCtrl.close');
      $rootScope.logmonOn = false;
      //LogService.setRunning(false);
      $scope.offListen();
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

    // Start the log monitor
    // $scope.start = function () {
    //   //LogService.setRunning(true);
    //   $scope.messages = ''; // Re-initialize messages
    //   $log.debug('controllers/LogCtrl event is ', constants.logEvent);
    //   // Add listener for socket:constants.logEvent broadcast
    //   $scope.offListen = $scope.$on('socket:' + constants.logEvent, function (event, data) {
    //     $log.debug('LogCtrl: got a message ', event.name, data);
    //     if (!data) {
    //       $log.error('controllers/LogCtrl: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
    //       return;
    //     }
    //     $scope.$apply(function () {
    //       $scope.messages = $scope.messages + formatter(new Date(), data);
    //     });
    //   });
    // };

    // $scope.stop = function () {
    //   // Remove listener for socket:constants.logEvent broadcast
    //   $scope.offListen();
    //   $rootScope.logmonOn = false;
    //   //LogService.setRunning(false);
    // };

    // var formatter = function (date, message) {
    //   return message + '\n';
    // };

  }]);
