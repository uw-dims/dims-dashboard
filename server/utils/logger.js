var winston = require('winston');
var config = require('../config');

require('winston-syslog').Syslog;

var logger = new (winston.Logger);

logger.add(winston.transports.Syslog);

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
//logger.setLevels(winston.config.syslog.levels);

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

