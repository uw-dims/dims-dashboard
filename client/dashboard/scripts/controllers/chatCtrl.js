'use strict';

angular.module('dimsDashboard.controllers').
  controller('ChatCtrl', function($scope, $location, $log, ChatService, $rootScope, Socket) {

    $log.debug('chatCtrl. scope.currentUser is ', $scope.currentUser);

    $scope.chatMaximized = true;
    $scope.chatClass = 'chatMax';
    $scope.messages ='';
    $scope.text = '';
    $scope.offListen = function() {};

    // Set up listener to listen for start and stop events from other scopes
    $scope.listener = function(event) {
      if (event === 'start') {
        $scope.start();
      } else if (event === 'stop') {
        $scope.stop();
      }
    };
    // Register as a listener for ChatService
    ChatService.registerObserverCallback($scope.listener);

    // Close the window and stop listening for chat messages
    $scope.close = function() {
      $rootScope.chatOn = false;
      ChatService.setRunning(false);
      $scope.offListen();
    };

    // Hide the window
    $scope.hide = function() {
      $rootScope.chatMaximized = false;
      $scope.chatClass = 'chatMin'
    };

    // Show the window
    $scope.show = function() {
      $rootScope.chatMaximized = true;
      $scope.chatClass = 'chatMax'
    };

    // Start the chat - invoked from an outside scope
    $scope.start = function(){
      ChatService.setRunning(true);
      $scope.messages = ''; // Re-initialize messages
      // Add listener for socket:chat:data broadcast
      $scope.offListen = $scope.$on('socket:chat:data', function(event, data) {
        $log.debug('ChatCtrl: got a message ', event.name, data);
        if (!data) {
          $log.error('ChatCtrl: Invalid message. ', 'event: ', event, 'data: ', JSON.stringify(data));
          return;
        }
        $scope.$apply(function() {
          $scope.messages = formatter(new Date(), data) + $scope.messages;
        });
      });
     };

     $scope.send = function() {
        var message = sendformatter($scope.text);
        $scope.text = '';
        // ChatService.send(message);
        Socket.then(function(socket) {
          $log.debug('chatCtrl.send, sending message ');
          socket.emit('chat:client', {
            message: message
          });
        });
     };

     $scope.stop = function() {
      // Remove listener for socket:chat:data broadcast
      $scope.offListen();
      $rootScope.chatOn = false;
      ChatService.setRunning(false);
     };

    var formatter = function(date, message) {
      return date.toLocaleTimeString() + ' - ' + message + '\n';
    };

    var sendformatter = function(text) {
      return $scope.currentUser.name + ': ' + text;
    };



  });