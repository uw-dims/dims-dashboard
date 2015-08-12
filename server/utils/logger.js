'use strict';

var winston = require('winston');
var config = require('../config/config');
var moment = require('moment');
var os = require('os');

//require('./winston-syslog').Syslog;

module.exports = function (callingModule) {

  // var winstonlogger = {};

  // Labeling inspired by
  // http://stackoverflow.com/questions/13410754/i-want-to-display-the-file-name-in-the-log-statement
  var getLabel = function () {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
  };

  var logger = new (winston.Logger);
  // logger.setLevels(winston.config.syslog.levels);

  // logger.add(winston.transports.Syslog, {
  //   level: config.logLevel,
  //   handleExceptions: true,
  //   json: false,
  //   colorize: false,
  //   localhost: os.hostname(),
  //   app_name: 'dimswebapp'
  // });

  logger.addFilter(function(msg, meta, level) {
    return moment().toISOString() + ' [' + getLabel() + '] ' + msg;
  });

  logger.add(winston.transports.File, {
    level: config.logLevel,
    handleExceptions: false,
    json: false,
    colorize: false,
    filename: config.logfile,
    maxsize: 1000000,
    tailable: true
  });

  if (config.env === 'development') {
    logger.add(winston.transports.Console, {
      level: config.logLevel,
      handleExceptions: false,
      json: false,
      colorize: true
    });
  }
  // Prepend with time

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



