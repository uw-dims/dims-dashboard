'use strict';

angular.module('dimsDashboard.services')

  .factory('Socket', function($q, $rootScope, socketFactory, $timeout, $log) {
    
    var socket = $q.defer();
    // Set up the socket and return the promise when we receive an authenticated event
    $rootScope.$on('authenticated', function() {

      $log.debug('Socket rootScope received authenticated event');

      var myIoSocket = io.connect(constants.SOCKETIO_URL);
      var mySocket = socketFactory({
        ioSocket: myIoSocket
      });
      // Broadcast events to $rootScope
      mySocket.forward('chat:data');
      mySocket.forward('logs:data');
      socket.resolve(mySocket);
    });
    return socket.promise;
    // return socket;
  })

  .factory('ChatService', function($log, Socket) {
      var chatService = {
        // True if chat running ($scope is listening on socket) or false if it is not
        running: false,
        // Getter for running
        isRunning: function() {
          return this.running;
        },
        // Setter for running
        setRunning: function(running) {
          this.running = running;
        },
        // Observers and functions
        observerCallbacks: [],
        registerObserverCallback: function(callback) {
          this.observerCallbacks.push(callback);
        },
        notifyObservers: function(args) {
          args = args || '';
          angular.forEach(this.observerCallbacks, function(callback) {
            callback(args);
          });
        },

        // Start the chat. Notify observers
        start: function() {
          chatService.running = true;
          $log.debug('ChatService start. ChatService running - ', chatService.running);
          this.notifyObservers('start');
        },
        // Stop the chat. Notify observers
        stop: function() {
          chatService.running = false;
          $log.debug('ChatService stop. ChatService running - ', chatService.running);
          this.notifyObservers('stop');
        },
        // Send a message
        send: function(message) {
          $log.debug('ChatService sending message', message);
          Socket.then(function(socket) {
            socket.emit('chat:client', message, function(message) {
              $log.debug('ChatService emitted message', message);
            });
          });
        }
      };
      return chatService;
  })

  .factory('LogService', function($log, Socket) {
      var logService = {
        // True if logging running ($scope is listening on socket) or false if it is not
        running: false,
        // Getter for running
        isRunning: function() {
          return this.running;
        },
        // Setter for running
        setRunning: function(running) {
          this.running = running;
        },
        // Observers and functions
        observerCallbacks: [],
        registerObserverCallback: function(callback) {
          this.observerCallbacks.push(callback);
        },
        notifyObservers: function(args) {
          args = args || '';
          angular.forEach(this.observerCallbacks, function(callback) {
            callback(args);
          });
        },
        // Start the log monitor. Notify observers
        start: function() {
          logService.running = true;
          $log.debug('LogService start. LogService running - ', logService.running);
          this.notifyObservers('start');
        },
        // Stop the log monitor. Notify observers
        stop: function() {
          logService.running = false;
          $log.debug('LogService stop. LogService running - ', logService.running);
          this.notifyObservers('stop');
        }
      };
      return logService;
  });