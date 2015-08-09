'use strict';

var amqp = require('amqplib');
var logger = require('../utils/logger');
var config = require('../config/config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(RabbitConnection, EventEmitter);

exports = module.exports = RabbitConnection;

function RabbitConnection(name, type) {
  var self = this;
  self.user = config.rpcUser;
  self.pwd = config.rpcPass;
  self.port = config.rpcPort;
  self.server = config.rpcServer;

  // name: exchange
  self.name = name || 'logs';
  // type: type of exchange
  self.type = type || 'fanout';
  if (self.type === 'fanout') {
    self.durable = false;
  } else {
    self.durable = true;
  }

  EventEmitter.call(self);
  self.open = amqp.connect('amqp://' + self.user + ':' + self.pwd + '@' + self.server);
  logger.debug('services/RabbitConnection: New RabbitConnection called');
};

RabbitConnection.prototype.subscribe = function () {

  var self = this;
  logger.debug('services/RabbitConnection.subscribe started');
  // self.open contains promise containing the connection
  self.open.then(function (conn) {
    // Save the connection so it can be closed later
    self.conn = conn;
    // Add listeners
    self.conn.on('close', function () {
      logger.debug('services/RabbitConnection received connection close event');
      self.emit('connectionClose');
    });

    self.conn.on('error', function (err) {
      logger.debug('services/RabbitConnection received connection error event', err);
      self.emit('connectionError', err);
    });

    // Create the channel
    return conn.createChannel().then(function (ch) {
        // save the channel so we can close it
        self.ch = ch;
        // save the channel number
        self.channel = ch.ch;
        logger.debug('services/RabbitConnection:subscribe: Channel created, number: ', ch.ch);

        // Add listeners
        self.ch.on('close', function () {
          logger.debug('services/RabbitConnection received channel close event');
          self.ch = null;
          self.emit('channelClose');
        });

        self.ch.on('error', function (err) {
          logger.debug('services/RabbitConnection received channel error event', err);
          self.emit('channelError', err);
        });

        // Assert the exchange
        return ch.assertExchange(self.name, self.type, {durable: self.durable});

      }).then(function (reply) {
        logger.debug('services/RabbitConnection:subscribe: Exchange Asserted ', reply.exchange);
        self.exchange = reply.exchange; // should be the same as self.name
        // Assert the queue
        return self.ch.assertQueue('', {exclusive: true});

      }).then(function (qok) {
          logger.debug('services/RabbitConnection:subscribe: Queue asserted. queue=', qok.queue, ' exchange=', self.exchange);
          // qok contains queue (aka name), messageCount, consumerCount
          self.queue = qok.queue;
          // Bind the queue
          return self.ch.bindQueue(qok.queue, self.name, '');

        }).then(function (reply) {
          // reply is empty object here
          logger.debug('services/RabbitConnection:subscribe: Queue bound. queue=', self.queue, ' exchange=', self.exchange);
          return self.ch.consume(self.queue, logMessage, {noAck: true});

        }).then(function (reply) {
          // Waiting for logs
          // Emit the ready event to notify listeners
          self.consumerTag = reply.consumerTag;
          logger.debug('services/RabbitConnection.subscribe: Ready. queue=', self.queue, ' exchange=', self.exchange, ' consumerTag=', self.consumerTag);
          // Send event indicated we are ready
          self.emit('ready', {'queue': self.queue, 'ch': self.ch.ch, 'exchange': self.exchange, 'consumerTag': self.consumerTag });
        });

    // This function handles incoming messages
    // Emits as event
    function logMessage(msg) {
      self.emit(self.name + ':receive', msg.content.toString());
    }
  });

};

RabbitConnection.prototype.initPublish = function () {

  var self = this;
  logger.debug('services/RabbitConnection.publish started');
  self.open.then(function (conn) {
      // Save the connection so it can be closed later
      self.conn = conn;
      self.conn.on('close', function () {
        logger.debug('services/RabbitConnection received connection close event');
        self.emit('connectionClose');
      });

      self.conn.on('error', function (err) {
        logger.debug('services/RabbitConnection received connection error event', err);
        self.emit('connectionError', err);
      });

      // Create the channel
      var ok = self.conn.createChannel();

      ok = ok.then(function (ch) {
        self.ch = ch;
        self.channel = ch.ch;
        logger.debug('services/RabbitConnection.publish: Channel created, number: ',ch.ch);

        self.ch.on('close', function () {
          logger.debug('services/RabbitConnection received channel close event');
          self.ch = null;
          self.emit('channelClose');
        });

        self.ch.on('error', function (err) {
          logger.debug('services/RabbitConnection received channel error event', err);
          self.emit('channelError', err);
        });

        self.pubExchange = ch.assertExchange(self.name, self.type, {durable: self.durable});
        // Check this
        return self.pubExchange;
      });
    }, function (err) {
      logger.error('services/RabbitConnection.initPublish: Connect failed: ', err);
    })
      .then(null, function (err) {
        logger.error('services/RabbitConnection.initPublish: Connect succeeded but error thrown: ', err);
      });
};

RabbitConnection.prototype.publish = function (message) {
  var self = this;
  return self.pubExchange.then(function (reply) {
          self.exchange = reply.exchange;
          self.ch.publish(self.name, '', new Buffer(message));
          // self.emit('ready', {'queue': self.queueName, 'ch': self.ch.ch });
        });
};


