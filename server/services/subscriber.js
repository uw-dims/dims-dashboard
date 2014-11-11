var RabbitConnection = require('../services/rabbitConnection');
var config = require('../config');
var logger = require('../utils/logger');
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

  logger.debug('Subscriber: ' + self.name + ': constructor');

  EventEmitter.call(self);
};

Subscriber.prototype.getName = function() {
  return self.name;
};

Subscriber.prototype.start = function() {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': starting...');
  if (self.running) {
    logger.debug('Subscriber: ' + self.name + ': already running');
    // console.log(self);
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
    self.rabbit.on(self.name+':receive', function(msg) {
      logger.debug('Subscriber: ' + self.name + ': message received', msg);
      self.emit(self.name+':receive', msg);
    });
    // self.rabbit.on('msg', self.onMessage);
    // Subscribe
    self.rabbit.subscribe();
  }
  
};

Subscriber.prototype.stop = function() {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': stopping...');
  if (self.running) {
    self.running = false;
    try {
      self.rabbit.conn.close();
    } catch (alreadyClosed) {
      logger.debug('Subscriber: ' + self.name + ': was already closed');
      self.running = false;
      self.emit(self.stopEvent);
    }
  } else {
    logger.debug('Subscriber: ' + self.name + ': was not running');
    self.emit(self.stopEvent);
  }
};

Subscriber.prototype.status = function() {
  var self = this;
  return (self.running) ? 'started' : 'stopped';
};

Subscriber.prototype.onMessage = function(msg) {
  // Pass on event
  logger.debug('Subscriber: ' + self.name + ': message received');
  //self.emit('msg', msg);
};

// Listener for the ready event emitted by a RabbitConnection object
Subscriber.prototype.onReady = function() {
  var self = this;
  // Set running property to indicate that this fanout is running
  self.running = true;
  // Notify others that the fanout is ready
  self.emit(self.startEvent);
};

// Listener for the close event emitted when a RabbitConnection closes
Subscriber.prototype.onClosed = function() {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': received connection close event');
  self.running = false;
  // Notify others that the fanout has stopped
  self.emit(self.stopEvent);
  self.rabbit = null;
};

// Listener for the close event emitted when a RabbitConnection channel closes
Subscriber.prototype.onChannelClosed = function() {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': received channel close event');
  console.log(self);
  if (self.running) {
    self.rabbit.subscribe();
  }
};

// Listener for the error event emitted by a RabbitConnection connection
Subscriber.prototype.onError = function(err) {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': received connection error event', err);
};

// Listener for the error event emitted by a RabbitConnection channel
Subscriber.prototype.onChannelError = function(err) {
  var self = this;
  logger.debug('Subscriber: ' + self.name + ': received channel error event', err);
  console.log(self);
};

