var logger = require('../utils/logger');
var config = require('../config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// util.inherits(SocketConnection, EventEmitter);
// var server = require('../app').server;
// var io = require('socket.io').listen(server, {
//   'log level' : 1
// })

// exports = module.exports = SocketConnection;
var Fanout = require('./fanout.js');
var numOpenSockets = 0;
var logFanout = new Fanout('logs');

logger.debug('Socketconnection created logFanout');

var IO_START = 'logmon:start';
var IO_STOP = 'logmon:stop';
var IO_LOG = 'logmon:data';
var BUFFER_SIZE = 3;

var buffer = [];

module.exports = function(io) {

  var discardClient = function() {
  logger.debug('socketConnection:discardClient: Client disconnected. Open sockets now: ', numOpenSockets-1);
  numOpenSockets--;

  if (numOpenSockets <= 0) {
    numOpenSockets = 0;
    logger.debug('socketConnection:discardClient. No active clients. Stop subscribing to fanout');
    logFanout.stop();
  }
};

var handleClient = function(data, socket) {
  if (data == true) {
    logger.debug('socketConnection:handleClient: Client connected');
    if (numOpenSockets <=0 ) {
      numOpenSockets = 0;
      logger.debug('socketConnection:handleClient: First active client. Start log fanout');
      logFanout.start();
    } else {
      logger.debug('socketConnection:handleClient: New active client: ', numOpenSockets+1,'. Fanout already running.')
    }
    numOpenSockets++;
  }
};

// Add listeners to socket
io.sockets.on('connection', function(socket) {
  logger.debug('socketConnection: Received connection event. Total sockets: ', io.sockets.sockets.length);
  // console.log(this);
  // console.log(this.server.eio.clients);

  socket.on(IO_START, function(data) {
    logger.debug('socketConnection: Received logmon:start event');
    handleClient(data, socket);
  });

  socket.on(IO_STOP, function() {
    logger.debug('socketConnection: Received logmon:stop event');
    discardClient();
  });

  socket.on('disconnect', function() {
    logger.debug('socketConnection: Received disconnect event');
    discardClient();
  });

});

logFanout.on('msg', function(msg) {
  // buffer.push(msg);
  logger.debug('socketConnection:logFanout received msg event. push packet ', msg);
  // broadcastLog();
  io.sockets.emit(IO_LOG, msg);
});

var broadcastLog = function() {
  if (buffer.length >= BUFFER_SIZE) {
    logger.debug('socketConnection:broadcastLog Send packet', buffer);
    io.sockets.emit(IO_LOG, buffer);
    buffer = [];
  }
};

};

