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

// Get the app configuration
var config = require('../config/config');
var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');
var StringReader = require('../utils/stringReader');
var logStream = require('logrotate-stream');

var SocketFactory = require('./socketFactory');
var AmqpConnection = require('./amqpConnection');
var healthLogger = require('../utils/healthLogger');

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
    healthLogger.publish('messaging healthy messaging amqp connection established', config.messagingHealthID);
    fanoutSetup();
  });
  messaging.amqp.on('connection-close', onConnectionClose.bind(this));

  socketSetup();

  function getLogConfig(name) {
    return {
      file: config.logmonPath + name + '.log',
      size: '1000k',
      keep: 20
    };
  }

  function getLogSave(name) {
    return config.fanoutExchanges[name].save;
  }

  function saveMsg(msg, name) {
    if (getLogSave(name)) {
      try {
        getReader(msg).pipe(logStream(getLogConfig(name)));
      } catch (err) {
        logger.error(err);
      }
    }
  }

  function getReader(msg) {
    var stringReader = new StringReader(msg);
    stringReader.on('error', function (err) {
      logger.error(err);
    });
    return stringReader;
  }

  function fanoutSetup() {
    _.forEach(config.fanoutExchanges, function (value, key) {
      var name = value.name;
      messaging.fanouts[name] = {};
      // Listen for successful fanout creation
      messaging.amqp.on(getEventName(name, 'ready'), function (reply) {
        logger.debug('Received ready event for fanout %s', value.name);
        healthLogger.publish('messaging/' + name + ' healthy ' + name + ' fanout ready', config.messagingHealthID);
        // Save fanout connection items
        messaging.fanouts[name].fanout = _.assign({}, reply);
      });
      // Listen for message received event
      messaging.amqp.on(getEventName(name, 'received'), function (msg) {
        // Socket emits message with data event (will go to client)
        messaging.sockets[name].socket.emit(getEventName(name, 'data'), msg);
        // Stream to log file - will be saving these via some other
        // mechanism to elasticsearch
        // saveMsg(msg, name);
      });
      // Save events that are being listened to so we can remove them later
      messaging.fanoutEvents.push(getEventName(name, 'received'));
      messaging.fanoutEvents.push(getEventName(name, 'ready'));
      // Start the fanout
      messaging.amqp.startFanout(name, value.durable);
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
    // healthLogger.publish('messaging amqp connection closed');
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
      messaging.sockets[key].on('error', function (err) {
        logger.error(err);
      });
    });
  }

  function getEventName(name, type) {
    return name + ':' + type;
  }

  return messaging;
};
