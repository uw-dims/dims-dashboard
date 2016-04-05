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

var logger = require('../utils/logger')(module);
var _ = require('lodash-compat');
var ChildProcess = require('../services/childProcess');

module.exports = function (UserSettings, anonService) {

  var anon = {};

  anon.anonymize = function (req, res) {
    var commandProgram,
        inputArray,
        settings,
        params = req.query;

    if (!req.user) {
      return res.status(500).send('Error: user is not defined in request');
    }
    var id = req.user.username;
    logger.debug('routes/anon.anonymize - Request: ', req.query);

    if (!_.isEmpty(req.body)) {
      logger.debug('routes/anon.anonymize - req.body is not empty');
      params.useFile = false;
      if (_.isEmpty(params.fileName)) {
        params.data = req.body;
      } else {
        return res.status(400).send('Request specified both file and data at the same time');
      }
    } else {
      params.useFile = true;
      if (_.isEmpty(params.fileName)) {
        res.status(400).send('Request did not contain data or file to anonymize');
      } else {
        params.data = params.fileName;
      }
    }

    if (_.isEmpty(params.type)) {
      params.type = 'anon';
    }

    // First, get the settings for the user
    UserSettings.getUserSettings(id)
    .then(function (reply) {
      settings = reply;
      return anonService.setup(params, settings.rpcDebug, settings.rpcVerbose);
    })
    .then(function (reply) {
      inputArray = reply;
      logger.debug('routes/anon.anonymize. Response from anonService.setup: inputArray = ', inputArray);
      if (req.query.type === 'ipgrep') {
        commandProgram = 'perl';
      } else {
        commandProgram = 'python';
      }
      var child = new ChildProcess();
      child.startProcess(commandProgram, inputArray).then(function (reply) {
        logger.debug('routes/anon.anonymize.setup. ChildProcess returned ', reply);
        return res.status(200).send(reply);
      }, function (err, reply) {
        return res.status(500).send(reply);
      });
    })
    .catch(function (err) {
      return res.status(500).send(reply);
    });

  };

  return anon;

};

