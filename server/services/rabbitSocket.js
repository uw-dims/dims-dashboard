'use strict';

var Publisher = require('./publisher.js');
var Subscriber = require('./subscriber.js');

var logger = require('../utils/logger')(module);
var util = require('util');

var EventEmitter = require('events').EventEmitter;
util.inherits(RabbitSocket, EventEmitter);

exports = module.exports = RabbitSocket;

function RabbitSocket(name, type, io) {
  var self = this;
  // Types of events
  // Received a packet from a client - needs to be published (client)
  // Received a packet from rabbit - needs to be emitted (receive)

  self.clientEvent = name + ':client';
  self.receiveEvent = name + ':receive';
  //logger.debug('Constructor. Receive event is ', self.receiveEvent);

  self.IO_MSG_TYPE = name + ':data';

  self.buffer = [];

  // Types of sockets
  // Publisher - publishes messages received from client to a fanout
  // Subscriber - subscribes to a fanout and emits messages to client

  if (type === 'publisher') {
    self.connection = new Publisher(name);
    // Publishes a message to the exchange. This will be the handler called when
    // messages are recevied from a client via a socket
    self.send = function (msg) {
      //logger.debug('Publisher Send function ' + name + ', msg is ', msg.message);
      self.connection.publish(msg.message);
    };

  } else {
    self.connection = new Subscriber(name);
    self.connection.on(self.receiveEvent, function (msg) {
      //logger.debug('Socket: Subscriber received message. Need to emit to client. Msg: ', self.IO_MSG_TYPE, msg);
      io.emit(self.IO_MSG_TYPE, msg);
    });
    self.send = function (msg) {
      logger.debug('Subscriber Send function: noop.');
    };
    self.connection.on('fanout:' + name + ':started', function (ev) {
      logger.debug('Connection.on subscriber received started event for ', name, 'ev=', ev);
    });
  }

  self.connection.start();
};

