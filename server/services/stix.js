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
var fs = require('fs');

module.exports = function () {

  var stix = {};

  //stix.extract.fileinfo  $stixpath 2>/dev/null
  //stix.extract.ip -maxTlp green  $stixpath 2>/dev/null

  var stixActions = {
    md5: '/opt/dims/bin/stix.extract.md5',
    ip: '/opt/dims/bin/stix.extract.ip',
    fileinfo: '/opt/dims/bin/stix.extract.fileinfo',
    json: '/opt/dims/bin/stix.extract.json',
    hostname: '/opt/dims/bin/stix.extract.hostname'
  };

  stix.extract = function extract(action, stixPath, tlpLevel) {
    var deferred = q.defer();

    logger.debug('in stix.extract action, path, level', action, stixPath, tlpLevel);

    if (!stixActions[action]) {
      throw new Error('Invalid action supplied');
    }

    var inputArray = [];
    var child = new ChildProcess();

    inputArray.push(stixActions[action]);
    inputArray.push('-maxTlp');
    inputArray.push(tlpLevel);
    inputArray.push(stixPath);

    child.startProcess('bash', inputArray)
    .then(function (reply) {
      logger.debug('extractSummary reply', reply);
      return deferred.resolve(reply);
    })
    .catch(function (err) {
      logger.error('error returned from extractSummary', err);
      return deferred.reject(err.toString());
    });
    return deferred.promise;
  };

  return stix;
};
