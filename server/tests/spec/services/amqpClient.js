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

var test = require('tape-catch');
var _ = require('lodash-compat');

var config = require('../../../config/config');
var logger = require('../../../utils/logger')(module);
var rpcClient = require('../../../services/amqpClient')();

var amqp = require('amqplib');
var connectionString = 'amqp://' + config.rpcUser + ':' + config.rpcPass + '@' + config.rpcServer;
var connection;
var q = 'test_queue';

// Set to skip unless we have rabbitmq docker container running
// to test
test.skip('Test amqpClient', function (assert) {
  // Stub the server
  var corrId;
  assert.plan(1);
  amqp.connect(connectionString).then(function (conn) {
    connection = conn;
    process.once('SIGINT', function () {conn.close();});
    return conn.createChannel().then(function (ch) {
      var ok = ch.assertQueue(q, {durable: false});
      ok = ok.then(function () {
        ch.prefetch(1);
        return ch.consume(q, reply);
      });
      return ok.then(function () {
        console.log(' [x] Awaiting RPC requests');
      });

      function reply(msg) {
        logger.debug('TEST SERVER msg received msg content', msg.content.toString());
        logger.debug('TEST SERVER msg received msg consumer tag', msg.fields.consumerTag);
        logger.debug('TEST SERVER msg received msg routing key', msg.fields.routingKey);
        logger.debug('TEST SERVER msg received msg correlationId', msg.properties.correlationId);
        logger.debug('TEST SERVER msg received replyTo', msg.properties.replyTo);
        corrId = msg.properties.correlationId;
        ch.sendToQueue(msg.properties.replyTo,
                       new Buffer(msg.content.toString() + ' REPLY'),
                       {correlationId: msg.properties.correlationId});
        ch.ack(msg);
        logger.debug('TEST SERVER end of reply function');
      }
    });
  }).catch(function (err) {
    logger.error('caught error', err);
    return new Error(err);
  });

  var message = 'This is a test message';
  var expected = message + ' REPLY';
  var client = rpcClient.clientFactory();
  logger.debug('TEST right before call client.request');
  client.request(message, q);
  client.prototype.on(client.getCorrelationId().toString(), function (reply) {
    logger.debug('TEST reply is ', reply);
    assert.equal(reply.msg, expected, '');
    connection.close();
  });
});
