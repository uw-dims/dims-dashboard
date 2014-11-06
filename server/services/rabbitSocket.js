var Publisher = require('./publisher.js');
var Subscriber = require('./subscriber.js');

var config = require('../config');
var logger = require('../utils/logger');
var util = require('util');

var EventEmitter = require('events').EventEmitter;
util.inherits(RabbitSocket, EventEmitter);

exports = module.exports = RabbitSocket;

function RabbitSocket(name, type, io) {
  var self = this;
  // Types of events
  // Received a packet from a client - needs to be published (client)
  // Received a packet from rabbit - needs to be emitted (receive)

  self.clientEvent = name+':client';
  self.receiveEvent = name+':receive';

  self.IO_MSG_TYPE = name+':data';

  self.buffer = [];

  // Types of sockets
  // Publisher - publishes messages received from client to a fanout
  // Subscriber - subscribes to a fanout and emits messages to client

  if (type === 'publisher') {
    self.connection = new Publisher(name);
    self.connection.on(self.clientEvent, function(msg) {
      logger.debug('Socket: received event from client. msg is ', msg )
      self.connection.publish(msg);
    });

  } else {
    self.connection = new Subscriber(name);
    self.connection.on(self.receiveEvent, function(msg) {
      logger.debug('Socket: Subscriber received message. Need to emit to client. Msg: ', msg);
      io.sockets.emit(self.IO_MSG_TYPE, msg);
    });
  }

  io.sockets.on('connection', function(socket) {
    logger.debug('Received connection event. Total sockets: ', io.sockets.sockets.length);
  });

  self.connection.start();
};

