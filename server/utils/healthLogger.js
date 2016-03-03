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

var config = require('../config/config');
var amqpLogger = require('../services/amqpLogger');
var moment = require('moment');
var os = require('os');
var uuid = require('node-uuid');

var healthLogger = amqpLogger(config.healthExchange);
console.log('[+++] HealthLogger starting...');
var label = 'utils/healthLogger.js';
var logLevel = 'INFO';

// Used for discrete UUIDs for different subsystems
var uuidSet = function uuidSet() {
  return {
    dashboard: uuid.v4(),
    redis: uuid.v4(),
    postgresql: uuid.v4(),
    messaging: uuid.v4()
  };
};

var UUIDs = uuidSet();

var format = function format(msg, id, level) {
  return moment().toISOString() + ' ' + os.hostname() + ' ' +
      UUIDs[id] + ' ' + config.appName + ' [' + label  + '] [' + process.pid + '] ' + level + ' ' +
      msg;
};

var publish = function (msg, id) {
  // Only publish health on dev or production systems, not when running tests
  if (config.env !== 'test') {
    try {
      healthLogger.pub(format(msg, id, logLevel));
    } catch (err) {
      console.log('[!!!] healthLogger publish error: ' + err);
    }
  }
};

healthLogger.publish = publish;

module.exports = healthLogger;
