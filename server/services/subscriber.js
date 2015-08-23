'use strict';

var RabbitConnection = require('../services/rabbitConnection');
var logger = require('../utils/logger')(module);
var util = require('util');

var EventEmitter = require('events').EventEmitter;
util.inherits(Subscriber, EventEmitter);

exports = module.exports = Subscriber;

function Subscriber(name) {
  var self = this;
  self.type = 'fanout';
  self.name = name;
  // Subscriber is not running
  self.running = false;
  self.rabbit = null;

  self.startEvent = 'fanout:' + self.name + ':started';
  self.stopEvent = 'fanout:' + self.name + ':stopped';

  logger.debug('Constructor: Name:', self.name, 'type: ', self.type);

  EventEmitter.call(self);
};

Subscriber.prototype.getName = function () {
  return self.name;
};

Subscriber.prototype.start = function () {
  var self = this;
  logger.debug('Start:' + self.name + ': starting...');
  if (self.running) {
    logger.debug('Start:' + self.name + ': already running');
  } else {
    // create the RabbitConnection
    self.rabbit = new RabbitConnection(self.name, self.type);
    // Set listeners for events
    self.rabbit.on('ready', self.onReady.bind(self));
    self.rabbit.on('connectionClose', self.onClosed.bind(self));
    self.rabbit.on('connectionError', self.onError.bind(self));
    self.rabbit.on('channelClose', self.onChannelClosed.bind(self));
    self.rabbit.on('channelError', self.onChannelError.bind(self));
    // Received subscribe receive event from rabbit
    // Propogate it up
    self.rabbit.on(self.name + ':receive', function (msg) {
      //logger.debug('Subscriber:' + self.name + 'message received', msg);
      self.emit(self.name + ':receive', msg);
    });
    // Subscribe
    self.rabbit.subscribe();
  }

};

Subscriber.prototype.stop = function () {
  var self = this;
  logger.debug('Stop:' + self.name + ': stopping... ch =', self.ch,
    'exchange =', self.exchange, 'queue =', self.queue, 'consumerTag =', self.consumerTag);
  if (self.running) {
    self.running = false;
    try {
      self.rabbit.conn.close();
    } catch (alreadyClosed) {
      logger.debug('Stop:' + self.name + ': was already closed');
      self.running = false;
      self.emit(self.stopEvent);
    }
  } else {
    logger.debug('Stop:' + self.name + ': was not running');
    self.emit(self.stopEvent);
  }
};

Subscriber.prototype.status = function () {
  var self = this;
  return (self.running) ? 'started' : 'stopped';
};

// Subscriber.prototype.onMessage = function (msg) {
//   // Pass on event
//   logger.debug('Subscriber: ' + self.name + ': message received');
//   //self.emit('msg', msg);
// };

// Listener for the ready event emitted by a RabbitConnection object
Subscriber.prototype.onReady = function (ev) {
  var self = this;
  logger.info('onReady: ', self.name, 'received ready event from RabbitConnection object. Event is ', ev);
  self.ch = ev.ch;
  self.exchange = ev.exchange;
  self.queue = ev.queue;
  self.consumerTag = ev.consumerTag;
  // Set running property to indicate that this fanout is running
  self.running = true;
  // Notify others that the fanout is ready
  self.emit(self.startEvent, ev);
};

// Listener for the close event emitted when a RabbitConnection closes
Subscriber.prototype.onClosed = function (ev) {
  var self = this;
  logger.debug('onClosed:' + self.name + ': received connection close event. ch =', self.ch,
    'exchange =', self.exchange, 'queue =', self.queue, 'consumerTag =', self.consumerTag + ' Event: ' + ev);
  self.running = false;
  // Notify others that the fanout has stopped
  self.emit(self.stopEvent);
  self.rabbit = null;
};

// Listener for the close event emitted when a RabbitConnection channel closes
Subscriber.prototype.onChannelClosed = function (ev) {
  var self = this;
  logger.debug('onChannelClosed:' + self.name + ': received channel close event. ch =', self.ch,
    'exchange =', self.exchange, 'queue =', self.queue, 'consumerTag =', self.consumerTag);
  if (self.running) {
    self.rabbit.subscribe();
  }
};

// Listener for the error event emitted by a RabbitConnection connection
Subscriber.prototype.onError = function (err) {
  var self = this;
  logger.debug('onError: ' + self.name + ': received connection error event', err, 'ch =', self.ch,
    'exchange =', self.exchange, 'queue =', self.queue, 'consumerTag =', self.consumerTag);
};

// Listener for the error event emitted by a RabbitConnection channel
Subscriber.prototype.onChannelError = function (err) {
  var self = this;
  logger.debug('onChannelError: ' + self.name + ': received channel error event', err, 'ch =', self.ch,
    'exchange =', self.exchange, 'queue =', self.queue, 'consumerTag =', self.consumerTag);
};

