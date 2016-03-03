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
      config.uuid + ' ' + config.appName + ' [' + getLabel()  + '] [' + process.pid + '] ' + level.toUpperCase() + ' ' +
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
        console.log('[!!!] logger applogger error, cannot publish. error: ' + err);
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
    logger.addFilter(dimsFormat);
  }

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



