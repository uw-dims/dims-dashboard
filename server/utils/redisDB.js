'use strict';

// This makes the client available to whoever requires this file
var redis = require('redis');
module.exports = redis.createClient();

// EOF
