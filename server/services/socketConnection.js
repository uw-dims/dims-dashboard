var logger = require('../utils/logger');
var config = require('../config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// util.inherits(SocketConnection, EventEmitter);
var io = require('../app').io;

// exports = module.exports = SocketConnection;

var numOpenSockets = 0;
var logFanout = new Fanout('logs');

var IO_START = 'fanout:start';
var IO_STOP = 'fanout:stop';
var IO_LOG = '';
var BUFFER_SIZE = 3;

var buffer = [];
var Fanout = require('./fanout.js');

var discardClient = function() {
  log.debug('socketConnection: Client disconnected');
  numOpenSockets--;

  if (numOpenSockets <= 0) {
    numOpenSockets = 0;
    log.debug('socketConnection: No active client. Stop subscribing to fanout');
    logFanout.stop();
  }
};

var handleClient = function(data, socket) {
  if (data == true) {
    log.debug('socketConnection: Client connected');
    if (numOpenSockets <=0 ) {
      numOpenSockets = 0;
      log.debug('socketConnection: First active client. Start log fanout');
      logFanout.start();
    }
    numOpenSockets++;
  }
};

// Add listeners to socket
io.sockets.on('connection', function(socket) {

  socket.on(IO_START, function(data) {
    handleClient(data, socket);
  });

  socket.on(IO_STOP, discardClient);

  socket.on('disconnect', discardClient);

});