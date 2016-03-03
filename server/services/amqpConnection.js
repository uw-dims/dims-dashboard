/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
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


