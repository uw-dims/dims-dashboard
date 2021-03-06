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

(function () {

  var ClientSockets = function ($q, $rootScope, socketFactory, $timeout, $log, ENV) {

    // Setup all the client sockets
    // Add listener to rootScope. Run when receive authenticated event

    // ioSocket object contains (among other things)
    // connected: true or false
    // disconnected: true or false
    // nsp: path

    var appSockets = {};
    // Connect to a socket described by an exchange (can add token later as another argument)
    function connect(exchange) {
      var url = ENV.DASHBOARD_PUBLIC_PROTOCOL + '://' + ENV.DASHBOARD_PUBLIC_HOST + ':' + ENV.DASHBOARD_PUBLIC_PORT + '/' + exchange.name;
      var thisSocket = {};
      thisSocket.ioSocket = io.connect(url, {forceNew: true});
      thisSocket.ioSocket.on('connect', function () {
      });
      return thisSocket;
    }

    function runFactory(ioSocket) {
      var thisSocket = socketFactory({
        ioSocket: ioSocket
      });
      return thisSocket;
    }

    $rootScope.$on('authenticated', function () {
      $log.debug('ClientSockets received authenticated event');
      //Establish each socket
      try {
        _.forEach(['chatExchanges', 'fanoutExchanges'], function (value, index) {
          _.forEach(constants[value], function (value, key) {
            $log.debug('ClientSockets set up appSocket for ', value.name);
            if (appSockets.hasOwnProperty(value.name)) {
              $log.debug('ClientSockets appSocket for %s already exists', value.name);
              appSockets[value.name].socket.connect();
              appSockets[value.name].socket.forward(value.event);
            } else {
              appSockets[value.name] = connect(value);
              appSockets[value.name].socket = runFactory(appSockets[value.name].ioSocket);
              appSockets[value.name].socket.forward(value.event);
            }
          });
        });
      } catch (err) {
        $log.error('An error was encountered setting up websockets. You will not' +
          'receive streaming messages from the server. Error: ', err);
      }

    });

    $rootScope.$on('logout', function () {
      // Disconnect each socket
      try {
        _.forEach(['chatExchanges', 'fanoutExchanges'], function (value, index) {
          _.forEach(constants[value], function (value, key) {
            appSockets[value.name].socket.removeAllListeners(value.event);
            appSockets[value.name].socket.disconnect();
          });
        });
      } catch (err) {
        $log.error('An error was encountered cleaning up websockets at logout.', err);
      } finally {
        appSockets = {};
      }
    });

    var getSocket = function getSocket(exchange) {
      return appSockets[exchange.name].socket;
    };

    var clientSockets = {
      getSocket: getSocket
    };
    return clientSockets;
  };

  var ChatService = function ($log, ClientSockets, $rootScope) {

    var stop = function stop(name) {
      chatService.running = false;
      $log.debug('ChatService stop. ChatService running - ', chatService.running);
      notifyObservers('stop');
    };

    var observerCallbacks = [];

    var notifyObservers = function (args) {
      // $log.debug('ChatService notifyObservers args:', args);
      args = args || '';
      angular.forEach(observerCallbacks, function (callback) {
        // $log.debug('ChatService notifyObservers in forEach', callback);
        callback(args);
      });
    };

    var chatService = {
      // True if chat running ($scope is listening on socket) or false if it is not
      running: false,
      // Getter for running
      isRunning: function () {
        return this.running;
      },
      // Setter for running
      setRunning: function (running) {
        this.running = running;
      },
      // Observers and functions
      registerObserverCallback: function (callback) {
        observerCallbacks.push(callback);
        // $log.debug('ChatService registerObserverCallback observerCallbacks: ', this.observerCallbacks);
      },

      // Start the chat. Notify observers
      start: function () {
        chatService.running = true;
        $log.debug('ChatService start. ChatService running - ', chatService.running);
        notifyObservers('start');
      },
      // Stop the chat. Notify observers
      stop: stop,
      // stop: function () {
      //   chatService.running = false;
      //   $log.debug('ChatService stop. ChatService running - ', chatService.running);
      //   this.notifyObservers('stop');
      // },
      // Send a message
      send: function (message) {
        // $log.debug('ChatService sending message', message);
        var socket = ClientSockets.getSocket(constants.chatExchanges.chat);
        socket.emit(constants.chatExchanges.chat.sendEvent, { message: message},
            function (message) {
            });
      }
    };
    $rootScope.$on('logout', chatService.stop.bind(this));
    return chatService;
  };

  var LogService = function (ClientSockets, $rootScope, $log) {

    var logs = {},
        observerCallbacks = {},
        notifyObservers = {};

    var init = function init() {
      _.forEach(constants.fanoutExchanges, function (value, key) {
        logs[value.name] = {};
        logs[value.name].running = false;
        observerCallbacks[value.name] = [];
        // Setup the collection of notify functions via currying
        notifyObservers[value.name] = notify(value.name);
      });
    };

    init();

    function notify(name) {
      return function (args) {
        args = args || '';
        angular.forEach(observerCallbacks[name], function (callback) {
          callback(args);
        });
      };
    }

    var stop = function stop(name) {
      logs[name].running = false;
      $log.debug('LogService stop. LogService running - ', logService.running);
      notifyObservers[name]('stop');
    };

    var stopAll = function stopAll() {
      $log.debug('Stopping all log fanouts');
      _.forEach(constants.fanoutExchanges, function (value, key) {
        stop(value.name);
      });
    };

    var logService = {
      // True if logging running ($scope is listening on socket) or false if it is not
      isRunning: function isRunning (name) {
        return logs[name].running;
      },
      // Setter for running
      setRunning: function setRunning (name, running) {
        logs[name].running = running;
      },
      registerObserverCallback: function (name, callback) {
        // $log.debug('LogService: registerObserverCallback: name, callback', name, callback);
        observerCallbacks[name].push(callback);
      },
      // Start the log monitor. Notify observers
      start: function start(name) {
        logs[name].running = true;
        $log.debug('LogService: start. LogService running - ', name);
        notifyObservers[name]('start');
      },
      // Stop the log monitor. Notify observers
      stop: stop,
      stopAll: stopAll
    };

    $rootScope.$on('logout', stopAll());

    return logService;
  };

  // Plug factory function into AngularJS
  angular.module('dimsDashboard.services')
      .factory('ClientSockets', ['$q', '$rootScope', 'socketFactory', '$timeout', '$log', 'ENV', ClientSockets])
      .factory('ChatService', ['$log', 'ClientSockets', '$rootScope', ChatService]);

  angular.module('dimsDashboard.services')
      .factory('LogService', ['ClientSockets', '$rootScope', '$log', LogService]);

}());

