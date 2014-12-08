'use strict';

var config = require('../config');
// This makes the client available to whoever requires this file
var redis = require('redis');
// module.exports = redis.createClient();
module.exports = redis.createClient(
  6379,
  config.redisHost,
  {}
);

// EOF
