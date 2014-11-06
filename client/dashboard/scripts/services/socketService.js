'use strict';

// angular.module('dimsDashboard.services')

  // .factory('SocketService', function($rootScope) {
  //   var socket = io.connect(constants.SOCKETIO_URL);
  //   console.log('url is ' + constants.SOCKETIO_URL);
  //   return {
  //     on: function(eventName, callback) {
  //       socket.on(eventName, function() {
  //         var args = arguments;
  //         $rootScope.$apply(function() {
  //           callback.apply(socket, args);
  //         });
  //       });
  //     },
  //     emit: function(eventName, data, callback) {
  //       console.log(eventName);
  //       console.log(data);
  //       socket.emit(eventName, data, function() {
  //         var args = arguments;

  //         $rootScope.$apply(function() {
  //           if (callback) {
  //             callback.apply(socket, args);
  //           }
  //         });
  //       });
  //     }
  //   };
  // })

  // .factory('Socket', ['$rootScope', function($rootScope) {

  //   var Socket = {
  //     messages: [],
  //     url: constants.SOCKETIO_URL,
  //     socket: io.connect(this.url),
  //     testMsg: function(msg) {
  //       console.log(msg);
  //     }
  //   };
  //   console.log('Created socket');
  //   // Set up listener
  //   (function() {
  //     Socket.socket.on('logmon:data', function(data) {
  //       if (data) {
  //         Socket.messages.push(data);
  //         $rootScope.$digest();
  //       }
  //     });
  //   }());
  //   return Socket;

  // }]);