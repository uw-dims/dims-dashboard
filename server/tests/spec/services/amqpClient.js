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
