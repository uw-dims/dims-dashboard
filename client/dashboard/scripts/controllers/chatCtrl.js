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
