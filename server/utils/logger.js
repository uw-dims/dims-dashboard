var winston = require('winston');
var config = require('../config');
var os = require('os');

//require('./winston-syslog/lib/winston-syslog').Syslog;

var logger = new (winston.Logger);
// logger.setLevels(winston.config.syslog.levels);

// logger.add(winston.transports.Syslog, {
//   level: config.log_level,
//   handleExceptions: true,
//   json: false,
//   colorize: false,
//   localhost: os.hostname(),
//   app_name: 'dimswebapp'
// });

if (process.env.NODE_ENV === 'development') {
  logger.add(winston.transports.Console, {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  });
}

logger.exitOnError = false;
logger.emitErrs = false;

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

