/**
  * Not used

var RabbitConnection = require('../services/rabbitConnection');
var config = require('../config');
var logger = require('../utils/logger');
var util = require('util');

var EventEmitter = require('events').EventEmitter;
util.inherits(Fanout, EventEmitter);

exports = module.exports = Fanout;

function Fanout(name) {
  var self = this;
  self.type = 'fanout';
  self.name = name;
  // Fanout is not running
  self.running = false;
  self.rabbit = null;

  self.startEvent = 'fanout:' + self.name + ':started';
  self.stopEvent = 'fanout:' + self.name + ':stopped';

  logger.debug('Fanout: ' + self.name + ': constructor');

  EventEmitter.call(self);
};


Fanout.prototype.start = function() {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': starting...');
  if (self.running) {
    logger.debug('Fanout: ' + self.name + ': already running');
    console.log(self);
  } else {
    // create the RabbitConnection
    self.rabbit = new RabbitConnection(self.name, self.type);
    // Set listeners for events
    self.rabbit.on('ready', self.onReady.bind(self));
    self.rabbit.on('connectionClose', self.onClosed.bind(self));
    self.rabbit.on('connectionError', self.onError.bind(self));
    self.rabbit.on('channelClose', self.onChannelClosed.bind(self));
    self.rabbit.on('channelError', self.onChannelError.bind(self));
    self.rabbit.on('msg', function(msg) {
      logger.debug('Fanout: ' + self.name + ': message received', msg);
      self.emit('msg', msg);
    });
    // self.rabbit.on('msg', self.onMessage);
    // Subscribe
    self.rabbit.subscribe();
  }
  
};

Fanout.prototype.stop = function() {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': stopping...');
  if (self.running) {
    self.running = false;
    try {
      self.rabbit.conn.close();
    } catch (alreadyClosed) {
      logger.debug('Fanout: ' + self.name + ': was already closed');
      self.running = false;
      self.emit(self.stopEvent);
    }
  } else {
    logger.debug('Fanout: ' + self.name + ': was not running');
    self.emit(self.stopEvent);
  }
};

Fanout.prototype.status = function() {
  var self = this;
  return (self.running) ? 'started' : 'stopped';
};

Fanout.prototype.onMessage = function(msg) {
  // Pass on event
  logger.debug('Fanout: ' + self.name + ': message received');
  //self.emit('msg', msg);
};

// Listener for the ready event emitted by a RabbitConnection object
Fanout.prototype.onReady = function() {
  var self = this;
  // Set running property to indicate that this fanout is running
  self.running = true;
  // Notify others that the fanout is ready
  self.emit(self.startEvent);
};

// Listener for the close event emitted when a RabbitConnection closes
Fanout.prototype.onClosed = function() {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': received connection close event');
  self.running = false;
  // Notify others that the fanout has stopped
  self.emit(self.stopEvent);
  self.rabbit = null;
};

// Listener for the close event emitted when a RabbitConnection channel closes
Fanout.prototype.onChannelClosed = function() {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': received channel close event');
  console.log(self);
  if (self.running) {
    self.rabbit.subscribe();
  }
};

// Listener for the error event emitted by a RabbitConnection connection
Fanout.prototype.onError = function(err) {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': received connection error event', err);
};

// Listener for the error event emitted by a RabbitConnection channel
Fanout.prototype.onChannelError = function(err) {
  var self = this;
  logger.debug('Fanout: ' + self.name + ': received channel error event', err);
  console.log(self);
};

*/
