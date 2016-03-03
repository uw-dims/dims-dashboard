'use strict';

var amqp = require('amqplib');
var config = require('../config/config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(AmqpLogPublisher, EventEmitter);

exports = module.exports = AmqpLogPublisher;

function AmqpLogPublisher(name, durable) {
  var self = this;
  self.user = config.rpcUser;
  self.pwd = config.rpcPass;
  self.port = config.rpcPort;
  self.server = config.rpcServer;
  self.name = name;
  self.durable = durable;

  self.connectionString = 'amqp://' + self.user + ':' + self.pwd + '@' + self.server;

  // Events
  self.connectionClose = 'connection-close';
  self.connectionError = 'connection-error';
  self.createError = 'create-error';
  self.connectionCreated = 'connection-created';
  self.fanoutCreateError = 'fanout-create-error';
  // Handler
  // self.on(self.createError, self.onFail.bind(self));
  EventEmitter.call(self);
}

AmqpLogPublisher.prototype.createConnection = function () {
  var self = this;
  console.log('[+++] amqpLogPublisher creating connection to ', self.server);
  amqp.connect(self.connectionString)
  .then(function (conn) {
    self.setConnection(conn);
    console.log('[+++] amqpLogPublisher connection created to ', self.server);
    // self.emit(self.connectionCreated);
    return self.connection.createChannel();
  })
  .then(function (ch) {
    self.channel = ch;
    self.channelNum = ch.ch;
    // result.channel.on('close', function () {
    //   logger.info('Channel %s for %s received close event.', result.channelNum, name);
    // });
    // result.channel.on('error', function (err) {
    //   logger.error('Channel %s for %s received error event', result.channelNum, name, err);
    // });
    // Assert exchange
    return self.channel.assertExchange(self.name, 'fanout', {durable: self.durable});
  })
  .then(function (reply) {
    self.exchange = reply.exchange; // should be the same as self.name
    self.emit('ready');
  })
  .catch(function (err) {
    console.log('[+++] amqpLogPublisher connection failure to ', self.server);
    self.emit(self.createError, self);
  })
  .done();
};

// Need to pass self (this) so it is propagated through multiple calls
AmqpLogPublisher.prototype.onFail = function (self) {
  console.log('[!!!] AmqpLogPublisher Connection failure. Trying again in 5 seconds...');
  setTimeout(function (self) {
    self.createConnection();
  }, 5000, self);
};

AmqpLogPublisher.prototype.setConnection = function (conn) {
  var self = this;
  self.connection = conn;
  self.connection.on('close', function () {
    console.log('[!!!] AmqpPublisher Connection received close event');
    // self.connection =  null;
    self.emit(self.connectionClose);
  });
  self.connection.on('error', function (err) {
    console.log('[!!!] AmqpPublisher Connection received error event.' + err.toString());
    self.emit(self.connectionError, err.toString());
  });
};
