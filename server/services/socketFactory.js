'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(SocketFactory, EventEmitter);
var logger = require('../utils/logger')(module);

// Controlling module for setting up sockets
module.exports = SocketFactory;

function SocketFactory(io, path, rcvEvent, pubEvent) {
  var self = this;
  self.path = path;
  self.rcvEvent = rcvEvent;
  self.pubEvent = pubEvent;
  EventEmitter.call(self);
  self.socket = self.createSocket(io);
}

// Handler for received messages that need to be published to fanout
SocketFactory.prototype.onMessage = function (msg) {
  var self = this;
  self.emit(self.pubEvent, msg.message);
};

// Returns a socket.io socket
SocketFactory.prototype.createSocket = function (io) {
  var self = this;
  // Path defines the socket address
  logger.debug('Creating new socket. path %s', self.path);
  var newSocket = io
    .of(self.path)
    .on('connection', function (socket) {
      self.connectionID = socket.conn.id;
      self.serverAddr = socket.conn.remoteAddress;
      self.clientIP = socket.conn.request.headers['x-real-ip'];
      logger.debug('Socket client connection: ID %s, path %s, IP %s', self.connectionID, self.path, self.clientIP);
      // Listener for receive event - needed if msg is supposed to be published
      if (self.pubEvent !== null) {
        // logger.debug('Set listener for io event %s', self.rcvEvent);
        socket.on(self.rcvEvent, self.onMessage.bind(self));
      }
      socket.on('disconnect', function (evt) {
        /* jshint unused: false */
        logger.debug('Socket disconnect from client: ID %s, path %s', socket.conn.id, self.path);
      });
      socket.on('error', function (err) {
        logger.error('Socket error: ConnectionID %s, path %s', socket.conn.id, self.path, err);
      });
    });
  return newSocket;
};

