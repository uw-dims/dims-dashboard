'use strict';

// File: server/utils/redisDB.js
// Provides a redis client

var config = require('../config/config');
var redis = require('redis');
var logger = require('./logger')(module);

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
  logger.info('utils.redisDB: redis client is connected to %s:%s, database %s',config.redisHost, config.redisPort,
        config.redisDatabase);
  client.select(config.redisDatabase, function (err, reply) {
    if (err) {
      logger.error('utils.redisDB: redis client received error when selecting database ', err);
    }
  });
});

module.exports = client;

// EOF
