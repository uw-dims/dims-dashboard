'use strict';

// File: server/utils/redisDB.js
// Provides a redis client

var config = require('../config/config');
var redis = require('redis');
var logger = require('./logger')(module);
var healthLogger = require('./healthLogger');

logger.debug('Connecting to Redis server ' + config.redisHost + ':' + config.redisPort);
var bluebird = require('bluebird');

var redisID = 'redis';

var client = bluebird.promisifyAll(redis.createClient(
  config.redisPort,
  config.redisHost,
  {}
));
bluebird.promisifyAll(client.multi());

client.on('error', function (err) {
  logger.error('utils.redisDB: ', err);
});

client.on('ready', function () {
  healthLogger.publish('redis healthy ' + config.redisHost + ':' + config.redisPort + ', database ' + config.redisDatabase, redisID);
  // logger.debug('redis client is connected to %s:%s, database %s', config.redisHost, config.redisPort,
  //       config.redisDatabase);
  client.select(config.redisDatabase, function (err, reply) {
    if (err) {
      healthLogger.publish('redis unhealthy received error when selecting database. Err: ' + err.toString(), redisID);
      logger.error('redis unhealthy received error when selecting database ', err);
    }
  });
});

client.on('close', function () {
  healthLogger.publish('Redis client closing connection', redisID);
});

module.exports = client;

// EOF
