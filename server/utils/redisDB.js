'use strict';

var config = require('../config');
// This makes the client available to whoever requires this file
var redis = require('redis');
var logger = require('./logger');
var client = redis.createClient(
  6379,
  config.redisHost,
  {}
);
module.exports = client;
client.select(config.redisDatabase, function(err, reply) {
    logger.debug('utils.redisDB: redis has selected db, reply is ', reply);
});


// EOF
