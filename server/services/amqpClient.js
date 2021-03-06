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

 /*
  * Client for RPC - future use
  */

'use strict';

var amqp = require('amqplib');
var when = require('when');
// var defer = when.defer;
var uuid = require('node-uuid');
var _ = require('lodash-compat');
var logger = require('../utils/logger')(module);
var config = require('../config/config');
var q = require('q');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/* istanbul ignore next */
module.exports = function amqpClient() {

  var connectString = 'amqp://' + config.rpcUser + ':' + config.rpcPass + '@' + config.rpcServer;
  var props = {};
  var maybeAnswer = function maybeAnswer(msg) {
    logger.debug('services/amqpClient.js request.maybeAnswer msg content', msg.content.toString());
    logger.debug('services/amqpClient.js request.maybeAnswer msg consumer tag', msg.fields.consumerTag);
    logger.debug('services/amqpClient.js request.maybeAnswer msg routing key', msg.fields.routingKey);
    logger.debug('services/amqpClient.js request.maybeAnswer msg correlationId', msg.properties.correlationId);
    if (msg.properties.correlationId === getCorrelationId()) {
      logger.debug('services/amqpClient.js correlationID match - send the resolve');
      // return props.conn.close()
      // .then(function (reply) {
      //   logger.debug('services/qmqpClient.js connection closed reply', reply);
      // return answer.resolve(msg.content.toString());
      return props.deferred.resolve(msg.content.toString());
      // });
    }
  };

  var setCorrelationId = function setCorrelationId(id) {
    props.corrId = id;
  };
  var getCorrelationId = function getCorrelationId() {
    return props.corrId;
  };

  var getConnection = function getConnection() {
    return props.connection;
  };
  var setConnection = function setConnection(conn) {
    props.connections = conn;
  };

  var getChannel = function getChannel() {
    return props.channel;
  };
  var setChannel = function setChannel(ch) {
    props.channel = ch;
  };
  var getQueue = function getQueue() {
    return props.queue;
  };
  var setQueue = function setQueue(queue) {
    props.queue = queue;
  };

  var clientPrototype = {
    getChannel: getChannel,
    setChannel: setChannel,
    getConnection: getConnection,
    setConnection: setConnection,
    getQueue: getQueue,
    setQueue: setQueue,
    setCorrelationId: setCorrelationId,
    getCorrelationId: getCorrelationId,
    request: function request(message, rpcQueue) {
      var self = this;
      logger.debug('request connectString', connectString);
      logger.debug('request message', message);
      amqp.connect(connectString)
      .then(function (conn) {
        setConnection(conn);
        // return when(conn.createChannel().then(function (ch) {
        return conn.createChannel().then(function (ch) {
          props.deferred = q.defer();
          logger.debug('request createChannel return ch');
          props.channel = ch;
          // var answer = defer();
          logger.debug('request corrId is', getCorrelationId());
          return props.channel.assertQueue('', {exclusive: true})
          .then(function (qok) {
            return qok.queue;
          })
          .then(function (queue) {
            props.queue = queue;
            logger.debug('request return from qok.queue queue', queue);
            logger.debug('request return from qok.queue getQueue()', getQueue());
            return ch.consume(queue, maybeAnswer, {noAck: true});
          })
          .then(function (tag) {
            logger.debug('request return from consume: consumer tag: ', tag);
            props.tag = tag;
            // return props.queue;
            logger.debug('request ready to send. queue is ', getQueue());
            props.channel.sendToQueue(rpcQueue, new Buffer(message), {
              correlationId: props.corrId, replyTo: props.queue});
            return props.deferred.promise;
            // return answer.promise;
          })
          .then(function (reply) {
            logger.debug('service/amqpClient.js return from sendToQueue reply', reply);
            // Emit event with message
            self.prototype.emit(props.corrId.toString(), {'msg': reply });
            props.conn.close();
          })
          .catch(function (err) {
            logger.error('caught error', err);
            return new Error(err);
          });
        });
      });
    }
  };

  var clientFactory = function clientFactory() {
    // Trying to avoid using constructors with New
    util.inherits(clientPrototype, EventEmitter);
    // Not sure if we need to include props here or not.
    var created = _.create(clientPrototype, props);
    EventEmitter.call(created);
    // Set the correlation ID for this instance
    created.setCorrelationId(uuid());
    logger.debug('corr id get', created.getCorrelationId());
    return created;
  };

  var client = {
    clientFactory: clientFactory
  };

  return client;
};





