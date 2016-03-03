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
  controller('ChatCtrl', function ($scope, $location, $log, ChatService, $rootScope) {

    $log.debug('chatCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.chatMaximized = true;
    $scope.chatClass = 'chatMax';
    $scope.messages = '';
    $scope.text = '';
    $scope.offListen = function () {};

    // Set up listener to listen for start and stop events from other scopes
    $scope.listener = function (event) {
      if (event === 'start') {
        $log.debug('chatctrl: listener. start');
        $scope.start();
      } else if (event === 'stop') {
        $log.debug('chatctrl: listener. stop');
        $scope.stop();
      }
    };

    $scope.chatOn = function () {
      return ChatService.isRunning();
    };
    // Register as a listener for ChatService
    ChatService.registerObserverCallback($scope.listener);

    // Close the window and stop listening for chat messages
    $scope.close = function () {
      //$rootScope.chatOn = false;
      ChatService.setRunning(false);
      $scope.offListen();
    };

    // Hide the window
    $scope.hide = function () {
      $log.debug('chatCtrl.hide');
      $scope.chatMaximized = false;
      $scope.chatClass = 'chatMin';
      $log.debug('chatCtrl hide chatMaximized class ', $scope.chatMaximized, $scope.chatClass);
    };

    // Show the window
    $scope.show = function () {
      $scope.chatMaximized = true;
      $scope.chatClass = 'chatMax';
    };

    // Start the chat - invoked from an outside scope
    $scope.start = function () {
      $log.debug('chatCtrl: start')
      ChatService.setRunning(true);
      $scope.messages = ''; // Re-initialize messages
      // Add listener for socket:constants.chatEvent broadcast
      $scope.offListen = $scope.$on('socket:' + constants.chatExchanges.chat.event, function (event, data) {
        $log.debug('ChatCtrl: got a message ', event.name, data);
        if (!data) {
          $log.error('ChatCtrl: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
          return;
        }
        $scope.$apply(function () {
          $scope.messages = $scope.messages + receiveFormatter(new Date(), data);
        });
      });
    };

    $scope.send = function () {
      var message = sendformatter($scope.text);
      $scope.text = '';
      ChatService.send(message);
    };

    $scope.stop = function () {
      // Remove listener for socket:constants.chatEvent broadcast
      $scope.offListen();
      //$rootScope.chatOn = false;
      ChatService.setRunning(false);
    };

    var receiveFormatter = function (date, message) {
      return date.toLocaleTimeString() + ' ' + message + '\n';
    };

    var sendformatter = function (text) {
      return $scope.currentUser.name + ': ' + text;
    };

  });
