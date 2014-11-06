'use strict';

angular.module('dimsDashboard.services')

  .factory('Socket', function($q, $rootScope, socketFactory, $timeout, $log) {
    
    var socket = $q.defer();

    $rootScope.$on('authenticated', function() {

      $timeout(function() {
        var newSocket = (function() {
          return socketFactory({
            ioSocket: io.connect(constants.SOCKETIO_URL)
          });
        })();

        socket.resolve(newSocket);

      });

    });
    return socket.promise;

  })

  .factory('ChatService', function($log, Socket) {
      var chatService = {
        chatMessages:[],
        running: false,

        isRunning: function() {
          return this.running;
        },

        start: function() {
          chatService.running = true;
          $log.debug('ChatService is Running');
          Socket.then(function(socket) { 
              // socket.on('chat:data', function(data) {
              //   $log.debug('chat:data - ', data);
              //   chatService.chatMessages.push(data);
              // });
              socket.forward('chat:data');
          });
        }, 

        stop: function() {
          chatService.running = false;
          $log.debug('ChatService is not Running');
          Socket.then(function(socket) {
            socket.removeListener('chat:data', function() {
              $log.debug('ChatService: removed listener');
            });
          });
        },

        send: function(message) {
          $log.debug('ChatService send message', message);
          Socket.then(function(socket) {
            socket.emit()
          });
        }
      };
      return chatService;

  })
  .factory('LogService', function($log, Socket) {
      var logService = {
        logMessages:[],
        running: false,
        isRunning: function() {
          return this.running;
        },
        start: function() {
          logService.running = true;
          $log.debug('LogService is Running');
          Socket.then(function(socket) { 
              // socket.on('log:data', function(data) {
              //   $log.debug('log:data - ', data);
              //   logService.logMessages.push(data);
              // });
            socket.forward('log:data');
          });
        },
        stop: function() {
          logService.running = false;
          $log.debug('LogService is not Running');
          Socket.then(function(socket) {
            socket.removeListener('log:data', function() {
              $log.debug('ChatService: removed listener');
            });
          });
        }
      };
      return logService;
  });