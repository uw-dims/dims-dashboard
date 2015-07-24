'use strict';

var config = require('../config');
// This makes the client available to whoever requires this file
var redis = require('redis');
var logger = require('./logger');
logger.info('utils.redisDB: Attempting to connect to Redis server ' + config.redisHost + ':' + config.redisPort);
var client = redis.createClient(
  config.redisPort,
  config.redisHost,
  {}
);

client.on('error', function (err) {
  logger.error('utils.redisDB: ', err);
});

client.on('ready', function () {
  logger.info('utils.redisDB: redis client has connected to ' + config.redisHost + ':' + config.redisPort);
  logger.info('utils.redisDB: selecting database ' + config.redisDatabase);
  client.select(config.redisDatabase, function (err, reply) {
    if (err) {
      logger.error('utils.redisDB: redis client received error when selecting database ', err);
    } else {
      logger.info('utils.redisDB: redis has selected db, reply is ', reply);
    }
  });
});

module.exports = client;

// EOF
