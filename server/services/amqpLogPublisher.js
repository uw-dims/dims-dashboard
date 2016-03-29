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
var config = require('../config/config');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logger = require('../utils/logger')(module);

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
  logger.info('amqpLogPublisher creating connection to ', self.server);
  amqp.connect(self.connectionString)
  .then(function (conn) {
    self.setConnection(conn);
    logger.info('amqpLogPublisher connection created to ', self.server);
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
    logger.info('amqpLogPublisher connection failure to ', self.server);
    self.emit(self.createError, self);
  })
  .done();
};

// Need to pass self (this) so it is propagated through multiple calls
AmqpLogPublisher.prototype.onFail = function (self) {
  logger.error('AmqpLogPublisher Connection failure. Trying again in 5 seconds...');
  setTimeout(function (self) {
    self.createConnection();
  }, 5000, self);
};

AmqpLogPublisher.prototype.setConnection = function (conn) {
  var self = this;
  self.connection = conn;
  self.connection.on('close', function () {
    logger.info('AmqpPublisher Connection received close event');
    // self.connection =  null;
    self.emit(self.connectionClose);
  });
  self.connection.on('error', function (err) {
    logger.info('AmqpPublisher Connection received error event.' + err.toString());
    self.emit(self.connectionError, err.toString());
  });
};
