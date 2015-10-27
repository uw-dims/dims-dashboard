'use strict';

// Get the app configuration
var config = require('../config/config');
var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');

var Publisher = require('./publisher');
var Subscriber = require('./subscriber');
var socketFactory = require('./sockets');

module.exports = function (io) {

  logger.info('Setting up socket.io, fanout subscribers and publishers');

  var messaging = {
    'sockets': {},
    'publishers': {},
    'subscribers': {}
  };

  // Set up sockets, publishers, subscribers for each fanout
  _.forEach(config.fanoutExchanges, function (value, key) {
    logger.debug('Iterate over exchanges, key, value: ', key, value);
    // Server publishes to this fanout, so create and start the publisher
    if (value.publish === true) {
      messaging.publishers[value.name] = new Publisher(value.name);
      messaging.publishers[value.name].start();
    }
    // We are sending and optionally receiving messages over socket.io for this fanout
    if (value.io === true) {
      // This fanout receives msgs from clients over socket and publishes them to AMQP
      if (value.ioRcv === true && value.publish === true) {
        messaging.sockets[value.name] =
          socketFactory(io, value.ioPath, value.ioEvent, messaging.publishers[value.name]);
      // This fanout only sends msgs over socket to client, or receives them but doesn't send to fanout
      } else {
        messaging.sockets[value.name] =
          socketFactory(io, value.ioPath);
      }
    }
    // Server subscribes to this fanout
    if (value.subscribe === true) {
      messaging.subscribers[value.name] = new Subscriber(value.name);
      // Server emits received messages from fanout to clients, so give start method the socket
      if (value.io === true) {
        messaging.subscribers[value.name].start(messaging.sockets[value.name]);
      // Server does not emit received messages from fanout, so don't give start method a socket
      } else {
        messaging.subscribers[value.name].start();
      }
    }

  });

  return messaging;
};
