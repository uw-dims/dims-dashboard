'use strict';

angular.module('dimsDashboard.services')

  .factory('ChatSocket', function($q, $rootScope, SocketFactory, $timeout, $log, ENV) {
    
    var socket = $q.defer();
    var hasRun = 0;
    // Set up the socket and return the promise when we receive an authenticated event
    $rootScope.$on('authenticated', function() {
      hasRun++ ;
      // If this has already run once, we only need to connect and set the listener
      // Need to do it this way to avoid creating extra sockets
      if (hasRun > 1) {
        socket.promise.then(function(socket) {
          socket.connect();
          socket.forward('chat:data');
        });
      } else {
        var myIoSocket = io.connect(ENV.PUBLICPROTOCOL+'://'+ENV.PUBLICHOST+':'+ENV.PUBLICPORTL+'/chat', {forceNew: true});
        var mySocket = SocketFactory({
          ioSocket: myIoSocket
        });
        // Broadcast events to $rootScope
        mySocket.forward('chat:data');
        socket.resolve(mySocket);
      }
    });
    return socket.promise;
  })

  .factory('LogSocket', function($q, $rootScope, SocketFactory, $timeout, $log, ENV) {
    
    var socket = $q.defer();
    var hasRun = 0;
    // Set up the socket and return the promise when we receive an authenticated event
    $rootScope.$on('authenticated', function() {
      hasRun++ ;
      // If this has already run once, we only need to connect and set the listener
      // Need to do it this way to avoid creating extra sockets
      if (hasRun > 1) {
        socket.promise.then(function(socket) {
          socket.connect();
          socket.forward('logs:data');
        });
      } else {
        var myIoSocket = io.connect(ENV.PUBLICPROTOCOL+'://'+ENV.PUBLICHOST+':'+ENV.PUBLICPORT+'/logs', {forceNew: true});
        var mySocket = SocketFactory({
          ioSocket: myIoSocket
        });
        // Broadcast events to $rootScope
        mySocket.forward('logs:data');
        socket.resolve(mySocket);
      }
    });
    return socket.promise;
  })

  .factory('ChatService', function($log, ChatSocket) {
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
          ChatSocket.then(function(socket) {
            socket.emit('chat:client', { message: message}, function(message) {
              $log.debug('ChatService emitted message', message);
            });
          });
        }
      };
      return chatService;
  })

  .factory('LogService', function($log, LogSocket) {
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