'use strict';

(function () {

  var ClientSockets = function ($q, $rootScope, socketFactory, $timeout, $log, ENV) {

    // Setup all the client sockets
    // Add listener to rootScope. Run when receive authenticated event

    var appSockets = {};
    // Connect to a socket described by an exchange (can add token later as another argument)
    function connect(exchange) {
      var url = ENV.DASHBOARD_PUBLIC_PROTOCOL + '://' + ENV.DASHBOARD_PUBLIC_HOST + ':' + ENV.DASHBOARD_PUBLIC_PORT + '/' + exchange.name;
      $log.debug('connect with ', url);
      var thisSocket = {};
      thisSocket.ioSocket = io.connect(url, {forceNew: true});
      thisSocket.ioSocket.on('connect', function () {
        $log.debug('ioSocket connected to ', exchange.name);
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
      $log.debug('ClientSockets authenticated handler');
      //Establish each socket
      try {
        _.forEach(['chatExchanges', 'fanoutExchanges'], function (value, index) {
          _.forEach(constants[value], function (value, key) {
            // See if a socket already exists
            appSockets[value.name] = connect(value);
            appSockets[value.name].socket = runFactory(appSockets[value.name].ioSocket);
            appSockets[value.name].socket.forward(value.event);
          });
        });
      } catch (err) {
        $log.error('An error was encountered setting up websockets. You will not' +
          'receive streaming messages from the server. Error: ', err);
      }

    });

    $rootScope.$on('logout', function () {
      $log.debug('ClientSockets logout handler');
      // Disconnect each socket
      try {
        _.forEach(['chatExchanges', 'fanoutExchanges'], function (value, index) {
          _.forEach(constants[value], function (value, key) {
            $log.debug('ClientSockets logout handler. value.name', value.name);
            $log.debug('ClientSockets logout handler. appSockets', appSockets[value.name]);
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
      console.log(appSockets);
      return appSockets[exchange.name].socket;
    };

    var clientSockets = {
      getSocket: getSocket
    };
    return clientSockets;
  };

  var ChatService = function ($log, ClientSockets) {
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
        $log.debug('ChatService.setRunning to ', running);
      },
      // Observers and functions
      observerCallbacks: [],
      registerObserverCallback: function (callback) {
        this.observerCallbacks.push(callback);
        $log.debug('ChatService registerObserverCallback observerCallbacks: ', this.observerCallbacks);
      },
      notifyObservers: function (args) {
        $log.debug('ChatService notifyObservers args:', args);
        args = args || '';
        angular.forEach(this.observerCallbacks, function (callback) {
          $log.debug('ChatService notifyObservers in forEach', callback);
          callback(args);
        });
      },

      // Start the chat. Notify observers
      start: function () {
        chatService.running = true;
        $log.debug('ChatService start. ChatService running - ', chatService.running);
        this.notifyObservers('start');
      },
      // Stop the chat. Notify observers
      stop: function () {
        chatService.running = false;
        $log.debug('ChatService stop. ChatService running - ', chatService.running);
        this.notifyObservers('stop');
      },
      // Send a message
      send: function (message) {
        $log.debug('ChatService sending message', message);
        var socket = ClientSockets.getSocket(constants.chatExchanges.chat);
        socket.emit(constants.chatExchanges.chat.sendEvent, { message: message},
            function (message) {
              $log.debug('ChatService emitted message', message);
            });
      }
    };
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
        $log.debug('LogService: init - value.name ', value.name);
        notifyObservers[value.name] = notify(value.name);
        $log.debug('LogService: show notifyObservers object in init');
        $log.debug(notifyObservers);
      });
    };

    init();

    function notify(name) {
      $log.debug('LogService: in notify name', name);
      return function (args) {
        $log.debug('LogService: in notify, name, args', name, args);
        console.log(observerCallbacks[name]);
        args = args || '';
        angular.forEach(observerCallbacks[name], function (callback) {
          $log.debug('LogService notify in forEach', callback);
          callback(args);
        });
      };
    };

    var stop = function stop(name) {
      logs[name].running = false;
      //$log.debug('LogService stop. LogService running - ', logService.running);
      notifyObservers[name]('stop');
    };

    var stopAll = function stopAll() {
      _.forEach(constants.fanoutExchanges, function (value, key) {
        stop(value.name);
      });
    };

    var logService = {
      // True if logging running ($scope is listening on socket) or false if it is not
      //running: false,
      // Getter for running
      isRunning: function isRunning (name) {
        return logs[name].running;
      },
      // Setter for running
      setRunning: function setRunning (name, running) {
        logs[name].running = running;
      },
      registerObserverCallback: function (name, callback) {
        $log.debug('LogService: registerObserverCallback: name, callback', name, callback);
        observerCallbacks[name].push(callback);
        console.log(observerCallbacks);
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
      .factory('ChatService', ['$log', 'ClientSockets', ChatService]);

  angular.module('dimsDashboard.services')
      .factory('LogService', ['ClientSockets', '$rootScope', '$log', LogService]);

}());


// angular.module('dimsDashboard.services')

  // .factory('ChatSocket', function ($q, $rootScope, SocketFactory, $timeout, $log, ENV) {

  //   var socket = $q.defer();
  //   var hasRun = 0;
  //   // Set up the socket and return the promise when we receive an authenticated event
  //   $rootScope.$on('authenticated', function () {
  //     hasRun++ ;
  //     // If this has already run once, we only need to connect and set the listener
  //     // Need to do it this way to avoid creating extra sockets
  //     if (hasRun > 1) {
  //       socket.promise.then(function (socket) {
  //         socket.connect();
  //         socket.forward(constants.chatEvent);
  //       });
  //     } else {
  //       $log.debug('services/ChatSocket: url is ' + ENV.DASHBOARD_PUBLIC_PROTOCOL + '://' + ENV.DASHBOARD_PUBLIC_HOST + ':' + ENV.DASHBOARD_PUBLIC_PORT + '/' + constants.fanoutExchanges.chat.name);
  //       var myIoSocket = io.connect(ENV.DASHBOARD_PUBLIC_PROTOCOL + '://' + ENV.DASHBOARD_PUBLIC_HOST + ':' + ENV.DASHBOARD_PUBLIC_PORT + '/' + constants.fanoutExchanges.chat.name, {forceNew: true});
  //       var mySocket = SocketFactory({
  //         ioSocket: myIoSocket
  //       });
  //       // Broadcast events to $rootScope
  //       mySocket.forward(constants.chatEvent);
  //       socket.resolve(mySocket);
  //     }
  //   });
  //   return socket.promise;
  // })

  // .factory('LogSocket', function ($q, $rootScope, SocketFactory, $timeout, $log, ENV) {


  //   var socket = $q.defer();
  //   var hasRun = 0;
  //   // Set up the socket and return the promise when we receive an authenticated event
  //   $rootScope.$on('authenticated', function () {
  //     hasRun++ ;
  //     // If this has already run once, we only need to connect and set the listener
  //     // Need to do it this way to avoid creating extra sockets
  //     if (hasRun > 1) {
  //       socket.promise.then(function (socket) {
  //         socket.connect();
  //         socket.forward(constants.logEvent);
  //       });
  //     } else {
  //       var myIoSocket = io.connect(ENV.DASHBOARD_PUBLIC_PROTOCOL+'://'+ENV.DASHBOARD_PUBLIC_HOST+':'+ENV.DASHBOARD_PUBLIC_PORT+'/' + constants.logExchange, {forceNew: true});
  //       var mySocket = SocketFactory({
  //         ioSocket: myIoSocket
  //       });
  //       // Broadcast events to $rootScope
  //       mySocket.forward(constants.logEvent);
  //       socket.resolve(mySocket);
  //     }
  //   });
  //   return socket.promise;
  // })

  // .factory('ChatService', function ($log, ChatSocket) {
  //     var chatService = {
  //       // True if chat running ($scope is listening on socket) or false if it is not
  //       running: false,
  //       // Getter for running
  //       isRunning: function () {
  //         return this.running;
  //       },
  //       // Setter for running
  //       setRunning: function (running) {
  //         this.running = running;
  //       },
  //       // Observers and functions
  //       observerCallbacks: [],
  //       registerObserverCallback: function (callback) {
  //         this.observerCallbacks.push(callback);
  //       },
  //       notifyObservers: function (args) {
  //         args = args || '';
  //         angular.forEach(this.observerCallbacks, function (callback) {
  //           callback(args);
  //         });
  //       },

  //       // Start the chat. Notify observers
  //       start: function () {
  //         chatService.running = true;
  //         $log.debug('ChatService start. ChatService running - ', chatService.running);
  //         this.notifyObservers('start');
  //       },
  //       // Stop the chat. Notify observers
  //       stop: function () {
  //         chatService.running = false;
  //         $log.debug('ChatService stop. ChatService running - ', chatService.running);
  //         this.notifyObservers('stop');
  //       },
  //       // Send a message
  //       send: function (message) {
  //         $log.debug('ChatService sending message', message);
  //         ChatSocket.then(function (socket) {
  //           socket.emit('chat:client', { message: message}, function (message) {
  //             $log.debug('ChatService emitted message', message);
  //           });
  //         });
  //       }
  //     };
  //     return chatService;
  // })

  // .factory('LogService', function ($log, LogSocket) {
  //     var logService = {
  //       // True if logging running ($scope is listening on socket) or false if it is not
  //       running: false,
  //       // Getter for running
  //       isRunning: function () {
  //         return this.running;
  //       },
  //       // Setter for running
  //       setRunning: function (running) {
  //         this.running = running;
  //       },
  //       // Observers and functions
  //       observerCallbacks: [],
  //       registerObserverCallback: function (callback) {
  //         this.observerCallbacks.push(callback);
  //       },
  //       notifyObservers: function (args) {
  //         args = args || '';
  //         angular.forEach(this.observerCallbacks, function (callback) {
  //           callback(args);
  //         });
  //       },
  //       // Start the log monitor. Notify observers
  //       start: function () {
  //         logService.running = true;
  //         $log.debug('LogService start. LogService running - ', logService.running);
  //         this.notifyObservers('start');
  //       },
  //       // Stop the log monitor. Notify observers
  //       stop: function () {
  //         logService.running = false;
  //         $log.debug('LogService stop. LogService running - ', logService.running);
  //         this.notifyObservers('stop');
  //       }
  //     };
  //     return logService;
  // });
