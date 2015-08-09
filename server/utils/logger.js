'use strict';

var winston = require('winston');
var config = require('../config/config');
var os = require('os');

//require('./winston-syslog').Syslog;

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

logger.add(winston.transports.File, {
  level: config.logLevel,
  handleExceptions: true,
  json: false,
  colorize: false,
  filename: config.logfile,
  maxsize: 1000000,
  tailable: true
});

if (config.env === 'development') {
  logger.add(winston.transports.Console, {
    level: config.logLevel,
    handleExceptions: true,
    json: false,
    colorize: true
  });
}

logger.exitOnError = false;
logger.emitErrs = false;

module.exports = logger;
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

