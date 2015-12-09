'use strict';

var config = require('../config/config');
var amqpLogger = require('../services/amqpLogger');
var moment = require('moment');
var os = require('os');
var uuid = require('node-uuid');

var healthLogger = amqpLogger(config.healthExchange);
console.log('[+++] HealthLogger starting...');
var label = 'utils/healthLogger.js';
var logLevel = 'INFO';

// Used for discrete UUIDs for different subsystems
var uuidSet = {
  dashboard: uuid.v4(),
  redis: uuid.v4(),
  postgresql: uuid.v4()
};

var format = function format(msg, id, level) {
  return moment().toISOString() + ' ' + os.hostname() + ' ' +
      uuidSet[id] + ' ' + config.appName + ' [' + label  + '] [' + process.pid + '] ' + level + ' ' +
      msg;
};

var publish = function (msg, id) {
  // Only publish health on dev or production systems, not when running tests
  if (config.env !== 'test') {
    try {
      healthLogger.pub(format(msg, id, logLevel));
    } catch (err) {
      console.log('[!!!] healthLogger publish error: ' + err);
    }
  }
};

healthLogger.publish = publish;

module.exports = healthLogger;
