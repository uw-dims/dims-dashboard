'use strict';

var config = require('../config/config');
var amqpLogger = require('../services/amqpLogger');
var moment = require('moment');
var os = require('os');
var uuid = require('node-uuid');

var healthLogger = amqpLogger(config.healthExchange);

var label = 'utils/healthLogger.js';
var logLevel = 'INFO';

var format = function format(msg, level) {
  return moment().toISOString() + ' ' + os.hostname() + ' ' +
      uuid.v4() + ' ' + config.appName + ' [' + label  + '] [' + process.pid + '] ' + level + ' ' +
      msg;
};

var publish = function (msg) {
  // Only publish health on dev or production systems, not when running tests
  if (config.env !== 'test') {
    try {
      healthLogger.pub(format(msg, logLevel));
    } catch (err) {
      console.log('[!!!] healthLogger publish error: ' + err);
    }
  }
};

healthLogger.publish = publish;

module.exports = healthLogger;
