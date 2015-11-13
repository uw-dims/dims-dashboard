'use strict';

var config = require('../config/config');
var amqpLogger = require('../services/amqpLogger');

var appLogger = amqpLogger(config.appLogExchange);

// Create publish function
var publish = function (msg) {
  try {
    appLogger.pub(msg);
  } catch (err) {
    console.log('[!!!] appLogger publish error: ' + err);
  }
};

appLogger.publish = publish;

module.exports = appLogger;
