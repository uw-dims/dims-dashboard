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
var config = require('../config/config');
var _ = require('lodash-compat');

module.exports = function () {
  var tupelo = {};

  var tupeloActions = {
    'findHashes': '/opt/dims/bin/tupelo.amqp.search'
  };

  var connectionString = 'amqp://' + config.rpcUser + ':' + config.rpcPass + '@' + config.rpcServer + '/%2F';

  tupelo.findHashes = function findHashes(hashArray) {
    var inputArray = [],
        child = new ChildProcess(),
        action = 'findHashes',
        deferred = q.defer();

    inputArray.push(tupeloActions[action]);
    inputArray.push('-u');
    inputArray.push(connectionString);
    inputArray.push('-json');
    _.forEach(hashArray, function (value) {
      inputArray.push(value + ' ');
    });

    child.startProcess('bash', inputArray)
    .then(function (reply) {
      logger.debug('findHashes reply', reply);
      return deferred.resolve(reply);
    })
    .catch(function (err) {
      logger.error('error returned from findHashes', err);
      return deferred.reject(err.toString());
    });
    return deferred.promise;
  };
  return tupelo;
};

