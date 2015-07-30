var Publisher = require('./publisher.js');
var Subscriber = require('./subscriber.js');

var config = require('../config/config');
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

  self.clientEvent = name + ':client';
  self.receiveEvent = name + ':receive';

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
      logger.debug('services/RabbitSocket publisher: Received client event from client ' + name + ', msg is ', msg.message);
      self.connection.publish(msg.message);
    };

  } else {
    self.connection = new Subscriber(name);
    self.connection.on(self.receiveEvent, function (msg) {
      // logger.debug('Socket: Subscriber received message. Need to emit to client. Msg: ', msg);
      io.emit(self.IO_MSG_TYPE, msg);
    });
    self.send = function (msg) {
      logger.debug('services/RabbitSocket: Subscriber noop.');
    };
    self.connection.on('fanout:' + name + ':started', function (ev) {
      logger.debug('services/RabbitSocket subscriber received started event for ', name, 'ev=', ev);
    });
  }

  self.connection.start();
};

