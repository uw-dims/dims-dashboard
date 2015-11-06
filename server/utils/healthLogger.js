'use strict';

var config = require('../config/config');
var amqpLogger = require('../services/amqpLogger');
var moment = require('moment');
var os = require('os');

var healthLogger = amqpLogger(config.healthExchange);
console.log('in healthlogger');

// Create publish function

var format = function format(msg) {
  return moment().toISOString() + ' ' + os.hostname() + ' ' +
      config.uuid + ' ' + config.appName + ' ' + process.pid + ' ' + msg;
};

var publish = function (msg) {
  // Only publish health on dev or production systems, not when running tests
  if (config.env !== 'test') {
    try {
      healthLogger.pub(format(msg));
    } catch (err) {
      console.log(err);
    }
  }
};

healthLogger.publish = publish;

module.exports = healthLogger;
