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
var q = require('q');
var ChildProcess = require('../services/childProcess');

/** Gets data from command line tool and anonymizes it if requested */
module.exports = function (UserSettings, anonService) {
  var tools = {};

  tools.getData = function (command, inputArray, id) {
    var deferred = q.defer();
    var child = new ChildProcess();
    var rawData,
        settings;

    child.startProcess(command, inputArray).then(function (reply) {
      // reply is the data
      rawData = reply;

      // Get user settings so we know whether or not the user has requested anonymization
      UserSettings.getUserSettings(id).then(function (reply) {
        settings = reply.settings;

        if (!settings.anonymize) {
          // Send back the raw data
          deferred.resolve(rawData);
        
        } else {
          // Need to anonymize before sending back
          anonService.setup({data: rawData, useFile: false, type: 'anon'}, settings.rpcDebug, settings.rpcVerbose)
          .then(function (reply) {
            inputArray = reply;
            
            var anonChild = new ChildProcess();
            anonChild.startProcess('python', inputArray).then(function (reply) {
              deferred.resolve(reply);
            }, function (err, reply) {
              logger.debug('services/tools.getData error from anon process ', err, reply);
              deferred.resolve(err);
            });
          }, function (err, reply) {
            logger.debug('services/tools.getData error is ', err, reply);
            deferred.resolve(err);
          });
        }
      }, function (err, reply) {
        logger.debug('services/tools.getData error  is ', err, reply);
        deferred.reject(err);
      });

    }, function (err, reply) {
      logger.debug('services/tools.getData error  is ', err, reply);
      deferred.reject(err);
    });

    return deferred.promise;
  };
  return tools;
};
