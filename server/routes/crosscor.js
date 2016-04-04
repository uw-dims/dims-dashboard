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

// var spawn =  require('child_process').spawn;
var dimsutil = require('../utils/util');
var logger = require('../utils/logger')(module);
var config = require('../config/config');

module.exports = function (tools) {
  var crosscor = {};

  crosscor.list = function (req, res) {

    logger.debug('crosscor:list - Request: ', req.query);

    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var id = req.user.username;

    var rpcQueuebase = config.rpcQueueNames.crosscor,
        rpcClientApp = 'crosscor_client',
        inputArray = [config.rpcbin + rpcClientApp, '--server', config.rpcServer,
            '--queue-base', rpcQueuebase];
    if (req.query.debug === 'true') {
      inputArray.push ('--debug');
    }
    if (req.query.verbose === 'true') {
      inputArray.push ('--verbose');
    }
    if (req.query.stats === 'true') {
      inputArray.push('-s');
    }
    if (req.query.fileName !== undefined) {
      inputArray.push('-r');
      inputArray.push(req.query.fileName);
    }
    if (req.query.iff !== undefined) {
      inputArray.push('-I');
      inputArray.push(req.query.iff);
    }
    if (req.query.mapName !== undefined) {
      inputArray.push('-m');
      inputArray.push(req.query.mapName);
    }

    logger.debug('crosscor:list - Input to python child process: ', inputArray);
    return tools.getData('python', inputArray, id)
    .then(function (reply) {
      logger.debug('routes/crosscor.list - Send 200 reply');
      return res.status(200).send(reply);
    })
    .catch(function (err) {
      logger.error('routes/crosscor.js catch block caught error: ', err);
      return res.status(500).send(err);
    });
  };

  return crosscor;

};

