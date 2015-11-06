'use strict';

// File: server/utils/redisDB.js
// Provides a redis client

var config = require('../config/config');
var redis = require('redis');
var logger = require('./logger')(module);
var healthLogger = require('./healthLogger');

logger.debug('Connecting to Redis server ' + config.redisHost + ':' + config.redisPort);

var client = redis.createClient(
  config.redisPort,
  config.redisHost,
  {}
);

client.on('error', function (err) {
  logger.error('utils.redisDB: ', err);
});

client.on('ready', function () {
  healthLogger.publish('healthy redis ' + config.redisHost + ':' + config.redisPort + ', database ' + config.redisDatabase);
  logger.debug('redis client is connected to %s:%s, database %s', config.redisHost, config.redisPort,
        config.redisDatabase);
  client.select(config.redisDatabase, function (err, reply) {
    if (err) {
      healthLogger.publish('redis received error when selecting database. Err: ' + err.toString());
      logger.error('unhealthy redis client received error when selecting database ', err);
    }
  });
});

client.on('close', function () {
  healthLogger.publish('Redis client closing connection');
});

module.exports = client;

// EOF
