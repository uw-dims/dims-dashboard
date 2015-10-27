'use strict';

var logger = require('../utils/logger')(module);

// Controlling module for setting up sockets

// Return a socket
// publisher should have a publish method. publisher sends to rabbitmq, not to the client
var createSocket = function createSocket(io, path, event, publisher) {
  // Path defines the socket address
  // Event is the receive event from the client
  logger.debug('createSocket: path, event', path, event);
  var newSocket = io
    .of(path)
    .on('connection', function (socket) {
      var info = {
        connectionID: socket.conn.id,
        serverAddr: socket.conn.remoteAddress
      };
      logger.debug('Received client connection event: ', info);
      logger.debug('event is ', event);
      // Send message to fanout when received from client on socket
      if (event !== undefined && publisher !== undefined) {
        socket.on(event, function (msg) {
          logger.debug('Received client event. ConnectionID: ', socket.conn.id, ' msg: ', msg);
          publisher.publish(msg.message);
        });
      }
      socket.on('disconnect', function (evt) {
        /* jshint unused: false */
        logger.debug('Chat socket.io: Received disconnect event from client. ConnectionID: ', socket.conn.id);
      });
    });
  return newSocket;
};

module.exports = createSocket;
