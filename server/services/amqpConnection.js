'use strict';

var amqp = require('amqplib');
var logger = require('../utils/logger')(module);
var config = require('../config/config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(AmqpConnection, EventEmitter);

exports = module.exports = AmqpConnection;

function AmqpConnection() {
  var self = this;
  self.user = config.rpcUser;
  self.pwd = config.rpcPass;
  self.port = config.rpcPort;
  self.server = config.rpcServer;

  self.connectionString = 'amqp://' + self.user + ':' + self.pwd + '@' + self.server;

  // Events
  self.connectionClose = 'connection-close';
  self.connectionError = 'connection-error';
  self.createError = 'create-error';
  self.connectionCreated = 'connection-created';
  self.fanoutCreateError = 'fanout-create-error';
  // Handler
  self.on(self.createError, self.onFail.bind(self));
  EventEmitter.call(self);
}

AmqpConnection.prototype.createConnection = function () {

  var self = this;
  logger.info('Creating connection to ', self.server);
  amqp.connect(self.connectionString)
  .then(function (conn) {
    logger.info('Connection established with ', self.server);
    self.setConnection(conn);
    self.emit(self.connectionCreated);
  })
  .catch(function (err) {
    logger.error('Connection creation error:', err.toString());
    self.emit(self.createError, self);
  })
  .done();
};

// Need to pass self (this) so it is propagated through multiple calls
AmqpConnection.prototype.onFail = function (self) {
  logger.debug('Connection failure. Trying again in 5 seconds...');
  setTimeout(function (self) {
    self.createConnection();
  }, 5000, self);
};

AmqpConnection.prototype.setConnection = function (conn) {
  var self = this;
  self.connection = conn;
  self.connection.on('close', function () {
    logger.info('Connection received close event');
    // self.connection =  null;
    self.emit(self.connectionClose);
  });
  self.connection.on('error', function (err) {
    logger.error('Connection received error event.', err.toString());
    self.emit(self.connectionError, err.toString());
  });
};

AmqpConnection.prototype.startFanout = function (name, durable) {
  var self = this;
  var result = {};
  // This function handles incoming messages
  function handleMessage(msg) {
    // Emit received event so it can be handled elsewhere
    self.emit(name + ':received', msg.content.toString());
  }
  return self.connection.createChannel()
  .then(function (ch) {
    logger.debug('StartFanout - channel obtained. name %s,  channel num', name, durable, ch.ch);
    result.channel = ch;
    result.channelNum = ch.ch;
    result.channel.on('close', function () {
      logger.info('Channel %s for %s received close event.', result.channelNum, name);
    });
    result.channel.on('error', function (err) {
      logger.error('Channel %s for %s received error event', result.channelNum, name, err);
    });
    // Assert exchange
    return result.channel.assertExchange(name, 'fanout', {durable: durable});
  })
  .then(function (reply) {
    result.exchange = reply.exchange; // should be the same as self.name
    // Assert the queue
    return result.channel.assertQueue('', {exclusive: true});
  })
  .then(function (reply) {
    // reply contains queue (aka name), messageCount, consumerCount
    result.queue = reply.queue;
    return result.channel.bindQueue(reply.queue, name, '');
  })
  .then(function () {
    return result.channel.consume(self.queue, handleMessage, {noAck: true});
  })
  .then(function (reply) {
    result.consumerTag = reply.consumerTag;
    logger.debug('Fanout %s ready. queue %s, consumerTag %s, exchange %s', name, result.queue, result.consumerTag, result.exchange);
    // Emit ready event
    self.emit(name + ':ready', result);
  })
  .catch(function (err) {
    logger.error('Fanout create error:', self.createError, err);
    self.emit(self.fanoutCreateError, err.toString());
  })
  .done();
};


