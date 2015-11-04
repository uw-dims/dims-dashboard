'use strict';

// Get the app configuration
var config = require('../config/config');
var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');

var SocketFactory = require('./socketFactory');
var AmqpConnection = require('./amqpConnection');

module.exports = function (io) {

  logger.info('Setting up socket.io, fanouts');

  var messaging = {
    'sockets': {},
    'fanouts': {},
    'amqp': null,
    fanoutEvents: [],
    socketEvents: []
  };

  // Create amqp object
  messaging.amqp = new AmqpConnection();
  // Create the connection
  messaging.amqp.createConnection();
  messaging.amqp.on('newListener', function (evtName, fn) {
    logger.debug('AMQP added listener for event %s', evtName);
  });
  messaging.amqp.on('removeListener', function (evtName) {
    logger.debug('AMQP removed listener for event %s', evtName);
  });
  messaging.amqp.on('connection-created', function () {
    logger.debug('Connection established');
    fanoutSetup();
  });
  messaging.amqp.on('connection-close', onConnectionClose.bind(this));

  socketSetup();

  function fanoutSetup() {
    _.forEach(config.fanoutExchanges, function (value, key) {
      messaging.fanouts[value.name] = {};
      // Listen for successful fanout creation
      messaging.amqp.on(getEventName(value.name, 'ready'), function (reply) {
        logger.debug('Received ready event for fanout %s', value.name);
        // Save fanout connection items
        messaging.fanouts[value.name].fanout = _.assign({}, reply);
      });
      // Listen for message received event
      messaging.amqp.on(getEventName(value.name, 'received'), function (msg) {
        // Socket emits message with data event (will go to client)
        messaging.sockets[value.name].socket.emit(getEventName(value.name, 'data'), msg);
      });
      messaging.fanoutEvents.push(getEventName(value.name, 'received'));
      messaging.fanoutEvents.push(getEventName(value.name, 'ready'));
      // Start the fanout
      messaging.amqp.startFanout(value.name, value.durable);
    });
  }

  function removeFanoutListeners() {
    // Remove listeners bound to fanout events
    _.forEach(messaging.fanoutEvents, function (value, index) {
      messaging.amqp.removeAllListeners(value);
    });
  }

  function onConnectionClose() {
    // Received a close event from amqp - need to re-establish
    removeFanoutListeners();
    messaging.fanoutEvents = [];
    messaging.fanouts = {};
    messaging.amqp.createConnection();
  }

  // Socket setup function
  function socketSetup() {
    _.forEach(config.sockets, function (value, key) {
      var publishEvent = (value.publish) ? getEventName(key, 'publish') : null;
      var receiveEvent = getEventName(key, 'client');
      logger.debug('SocketSetup. publishEvent: %s, receiveEvent: %s', publishEvent, receiveEvent);
      messaging.sockets[key] =
        new SocketFactory(io, value.ioPath, receiveEvent, publishEvent);
      messaging.sockets[key].on(publishEvent, function (msg) {
        try {
          messaging.fanouts[key].fanout.channel.publish(key, '', new Buffer(msg));
        } catch (err) {
          logger.error('Cannot publish message on %s received by socket at this time. Error: ', key, err.toString());
        }
      });
    });
  }

  function getEventName(name, type) {
    return name + ':' + type;
  }

  return messaging;
};
