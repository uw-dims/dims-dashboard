'use strict';

var winston = require('winston');
var config = require('../config/config');
var moment = require('moment');
var os = require('os');
var spawn =  require('child_process').spawn;
var util = require('util');

module.exports = function (callingModule) {

  // var winstonlogger = {};

  // function from
  // http://stackoverflow.com/questions/13410754/i-want-to-display-the-file-name-in-the-log-statement
  var getLabel = function () {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
  };

  // Future - custom amqp logger. Will add node.js publisher
  // var CustomLogger = winston.transports.CustomLogger = function (options) {
  //   this.name = 'amqpLogger';
  //   this.level = options.level || config.logLevel;
  //   this.logExchange = config.logExchange;
  // };

  // util.inherits(CustomLogger, winston.Transport);

  // CustomLogger.prototype.log = function (level, msg, meta, callback) {
  //   var childProcess = spawn(
  //     '/opt/dims/envs/dimsenv/bin/logmon',
  //     ['-l', this.logExchange, '-m', msg]
  //   );
  //   callback(null, true);
  // };

  var logger = new (winston.Logger);

  //logger.setLevels(winston.config.syslog.levels);

  // logger.add(winston.transports.Syslog, {
  //   level: config.logLevel,
  //   handleExceptions: true,
  //   json: false,
  //   colorize: false,
  //   localhost: os.hostname(),
  //   app_name: 'DIMS-DASHBOARD'
  // });

  logger.addFilter(function (msg, meta, level) {
    return moment().toISOString() + ' ' + os.hostname() + ' ' +
      config.uuid + ' [' + getLabel() + '] ' + level.toUpperCase() + ' ' + process.pid + ' ' +
      msg;
  });

  // Will replace once we figure out where to send the logs
  // if (config.env === 'production') {
  //   logger.add(winston.transports.File, {
  //     level: config.logLevel,
  //     handleExceptions: false,
  //     json: false,
  //     colorize: false,
  //     filename: config.logfile,
  //     maxsize: 1000000,
  //     tailable: true
  //   });
  // }

  // if (config.env === 'development') {
  logger.add(winston.transports.Console, {
    level: config.logLevel,
    handleExceptions: false,
    json: false,
    colorize: true
  });

  // logger.add(CustomLogger, {
  //   level: config.logLevel
  // });

  
  // }
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



