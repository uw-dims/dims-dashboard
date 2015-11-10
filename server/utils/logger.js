'use strict';

var winston = require('winston');
var config = require('../config/config');
var moment = require('moment');
var os = require('os');
var util = require('util');
var _ = require('lodash-compat');

module.exports = function (callingModule) {

  var appLogger;

  // function from
  // http://stackoverflow.com/questions/13410754/i-want-to-display-the-file-name-in-the-log-statement
  var getLabel = function getLabel() {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
  };

  // Adds to log output for development or production
  var dimsFormat = function dimsFormat(msg, meta, level) {
    return moment().toISOString() + ' ' + os.hostname() + ' ' +
      config.uuid + ' ' + config.appName + '/server/' + getLabel() + ' ' + level.toUpperCase() + ' ' + process.pid + ' ' +
      msg;
  };

  // Update the log level for a transport
  var updateLogLevel = function updateLogLevel(transport, level) {
    logger.transports[transport].level = level;
  };

  // Define our custom logger for logging to AMQP if we are not doing testing
  if (config.env !== 'test') {
    appLogger = require('./appLogger');
    var CustomLogger = winston.transports.CustomLogger = function (options) {
      var self = this;
      self.name = options.name || 'amqpLogger';
      self.exchange = options.exchange || config.appLogName;
      self.level = options.level || config.logLevel;
    };
    util.inherits(CustomLogger, winston.Transport);
    CustomLogger.prototype.log = function (level, msg, meta, callback) {
      var self = this;
      try {
        // appLogger.channel.publish(this.exchange, '', new Buffer(msg));
        appLogger.publish(msg);
      } catch (err) {
        // no-op - will get error here until the channel is ready
      } finally {
        callback(null, true);
      }
    };
  }

  // var updateExchange = function updateExchange(exchange) {
  //   logger.transport.CustomLogger
  // }

  var evChangeLevel = 'change-log-level';
  var evChangeExchange  = 'change-exchange';

  var logger = new (winston.Logger);

  // Add the custom logger if not test
  if (config.env !== 'test') {
    logger.add(CustomLogger, {
      level: config.logLevel,
      exchange: config.appLogExchange
    });
  }

  logger.addFilter(dimsFormat);

  if (config.env === 'development' || config.env === 'test') {
    logger.add(winston.transports.Console, {
      level: config.logLevel,
      handleExceptions: false,
      json: false,
      colorize: true
    });
  }

  logger.on(evChangeLevel, updateLogLevel.bind(this));
  // logger.on(evChangeExchange, updateExchange.bind(this));

  logger.exitOnError = false;
  logger.emitErrs = false;

  // winstonlogger.logger = logger;
  logger.stream = {
    write: function (message, encoding) {
      logger.info(message);
    }
  };

  return logger;

};



