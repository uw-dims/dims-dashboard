'use strict';

var amqp = require('amqplib');
var when = require('when');
// var defer = when.defer;
var uuid = require('node-uuid');
var _ = require('lodash-compat');
var logger = require('../utils/logger');
var config = require('../config/config');
var q = require('q');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

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
    getQueue: getQueue,
    setQueue: setQueue,
    setCorrelationId: setCorrelationId,
    getCorrelationId: getCorrelationId,
    request: function request(message, rpcQueue) {
      var self = this;
      logger.debug('services/ampqClient.js request connectString', connectString);
      amqp.connect(connectString)
      .then(function (conn) {
        props.conn = conn;
        // return when(conn.createChannel().then(function (ch) {
        return conn.createChannel().then(function (ch) {
          props.deferred = q.defer();
          logger.debug('services/amqpclient.js createChannel return ch');
          props.channel = ch;
          // var answer = defer();
          logger.debug('services/amqpclient.js corrId is ', getCorrelationId());
          logger.debug('services/amqpclient.js corrId is ', props.corrId);
          return props.channel.assertQueue('', {exclusive: true})
          .then(function (qok) {
            logger.debug('services/amqpClient.js return from assertQueue');
            return qok.queue;
          })
          .then(function (queue) {
            props.queue = queue;
            logger.debug('services/ampqClient.js request return from qok.queue queue', queue);
            logger.debug('services/ampqClient.js request return from qok.queue props.queue', props.queue);
            logger.debug('services/ampqClient.js request return from qok.queue getQueue()', getQueue());
            return ch.consume(queue, maybeAnswer, {noAck: true});
          })
          .then(function (tag) {
            logger.debug('services/amqpClient.js request return from consume: consumer tag: ', tag);
            props.tag = tag;
            // return props.queue;
            logger.debug('service/amqpClient.js request ready to send. queue is ', props.queue);
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





