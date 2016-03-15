/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

'use strict';

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
