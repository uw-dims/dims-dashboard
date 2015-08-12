'use strict';

var RabbitConnection = require('../services/rabbitConnection');
var logger = require('../utils/logger')(module);
var util = require('util');

var EventEmitter = require('events').EventEmitter;
util.inherits(Publisher, EventEmitter);

exports = module.exports = Publisher;

function Publisher(name) {
  var self = this;
  self.type = 'fanout';
  self.name = name;
  // Publisher is not running
  self.running = false;
  self.rabbit = null;

  self.startEvent = 'fanout:' + self.name + ':started';
  self.stopEvent = 'fanout:' + self.name + ':stopped';

  logger.debug('services/Publisher: ' + self.name + ': constructor');

  EventEmitter.call(self);
};

Publisher.prototype.getName = function () {
  return self.name;
};

Publisher.prototype.start = function () {
  var self = this;
  logger.debug('services/Publisher.start: ' + self.name + ': starting...');
  if (self.running) {
    logger.debug('services/Publisher.start: ' + self.name + ': already running');
  } else {
    // create the RabbitConnection
    self.rabbit = new RabbitConnection(self.name, self.type);
    // Set listeners for events
    self.rabbit.on('ready', self.onReady.bind(self));
    self.rabbit.on('connectionClose', self.onClosed.bind(self));
    self.rabbit.on('connectionError', self.onError.bind(self));
    self.rabbit.on('channelClose', self.onChannelClosed.bind(self));
    self.rabbit.on('channelError', self.onChannelError.bind(self));
    // Initialize
    self.rabbit.initPublish();
  }

};

Publisher.prototype.stop = function () {
  var self = this;
  logger.debug('services/Publisher.stop: ' + self.name + ': stopping...');
  if (self.running) {
    self.running = false;
    try {
      self.rabbit.conn.close();
    } catch (alreadyClosed) {
      logger.debug('services/Publisher.stop: ' + self.name + ': was already closed');
      self.running = false;
      self.emit(self.stopEvent);
    }
  } else {
    logger.debug('services/Publisher.stop: ' + self.name + ': was not running');
    self.emit(self.stopEvent);
  }
};

Publisher.prototype.publish = function (message) {
  var self = this;
  logger.debug('services/Publisher.publish: ' + self.name + ': Publish');
  self.rabbit.publish(message);
};

Publisher.prototype.status = function () {
  var self = this;
  return (self.running) ? 'started' : 'stopped';
};

// Listener for the ready event emitted by a RabbitConnection object
Publisher.prototype.onReady = function (ev) {
  logger.info('services/Publisher received ready event from RabbitConnection object. Event is ', ev);
  var self = this;
  // Set running property to indicate that this fanout is running
  self.running = true;
  // Notify others that the fanout is ready
  self.emit(self.startEvent);
};

// Listener for the close event emitted when a RabbitConnection closes
Publisher.prototype.onClosed = function (ev) {
  var self = this;
  logger.debug('services/Publisher.onClosed: ' + self.name + ': received connection close event. ' + ev);
  self.running = false;
  // Notify others that the fanout has stopped
  self.emit(self.stopEvent);
  self.rabbit = null;
};

// Listener for the close event emitted when a RabbitConnection channel closes
Publisher.prototype.onChannelClosed = function (ev) {
  var self = this;
  logger.debug('services/Publisher.onChannelClosed: ' + self.name + ': received channel close event. ' + ev);
  console.log(self);
  if (self.running) {
    self.initPublish();
  }
};

// Listener for the error event emitted by a RabbitConnection connection
Publisher.prototype.onError = function (err) {
  var self = this;
  logger.debug('services/Publisher.onError: ' + self.name + ': received connection error event', err);
};

// Listener for the error event emitted by a RabbitConnection channel
Publisher.prototype.onChannelError = function (err) {
  var self = this;
  logger.debug('services/Publisher.onChannelError: ' + self.name + ': received channel error event', err);
  console.log(self);
};

